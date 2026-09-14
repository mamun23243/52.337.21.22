import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { PrismaClient, UserStatus, RoleName } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT || 4000);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET || "change-this-in-production";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "change-this-refresh-secret";

app.use(helmet());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit:"1mb" }));
app.use(cookieParser());

type AuthRequest = Request & { user?: { id:string; role:RoleName } };

function signAccess(user:{id:string;role:RoleName}) {
  return jwt.sign({ sub:user.id, role:user.role }, JWT_SECRET, { expiresIn:"15m" });
}
function signRefresh(user:{id:string}) {
  return jwt.sign({ sub:user.id }, REFRESH_SECRET, { expiresIn:"7d" });
}
function auth(req:AuthRequest,res:Response,next:NextFunction) {
  const token=req.cookies.access_token;
  if(!token) return res.status(401).json({message:"Unauthorized"});
  try {
    const p:any=jwt.verify(token,JWT_SECRET);
    req.user={id:p.sub,role:p.role};
    next();
  } catch { return res.status(401).json({message:"Session expired"}); }
}
function requireRole(...roles:RoleName[]) {
  return (req:AuthRequest,res:Response,next:NextFunction)=>{
    if(!req.user || !roles.includes(req.user.role)) return res.status(403).json({message:"Forbidden"});
    next();
  };
}
function ip(req:Request){ return (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress || ""; }

app.get("/health",(_,res)=>res.json({ok:true,status:"online"}));

app.post("/api/auth/login", async (req,res)=>{
  const parsed=z.object({
    identifier:z.string().min(1),
    email:z.string().optional(),
    username:z.string().optional(),
    password:z.string().min(1),
    remember:z.boolean().optional()
  }).safeParse(req.body);
  if(!parsed.success) return res.status(400).json({message:"Invalid login data"});
  const {identifier,password,remember}=parsed.data;
  const user=await prisma.user.findFirst({where:{OR:[{email:identifier},{username:identifier}]}});

  if(!user) {
    await prisma.loginHistory.create({data:{success:false,ipAddress:ip(req),userAgent:req.headers["user-agent"]}});
    return res.status(401).json({message:"Invalid username/email or password"});
  }

  if(user.status !== UserStatus.ACTIVE) return res.status(403).json({message:"This account is inactive or locked."});
  if(user.lockedUntil && user.lockedUntil > new Date()) return res.status(423).json({message:"Account temporarily locked."});

  const ok=await bcrypt.compare(password,user.passwordHash);
  if(!ok){
    const failed=user.failedAttempts+1;
    await prisma.user.update({where:{id:user.id},data:{failedAttempts:failed,lockedUntil:failed>=5?new Date(Date.now()+15*60*1000):null}});
    await prisma.loginHistory.create({data:{userId:user.id,success:false,ipAddress:ip(req),userAgent:req.headers["user-agent"]}});
    return res.status(401).json({message:"Invalid username/email or password"});
  }

  await prisma.user.update({where:{id:user.id},data:{failedAttempts:0,lockedUntil:null,lastLoginAt:new Date()}});
  await prisma.loginHistory.create({data:{userId:user.id,success:true,ipAddress:ip(req),userAgent:req.headers["user-agent"]}});
  await prisma.activityLog.create({data:{userId:user.id,action:"LOGIN",description:"Successful login",ipAddress:ip(req),userAgent:req.headers["user-agent"]}});

  const access=signAccess({id:user.id,role:user.role});
  const refresh=signRefresh({id:user.id});
  const refreshHash=await bcrypt.hash(refresh,10);
  await prisma.session.create({data:{userId:user.id,refreshHash,expiresAt:new Date(Date.now()+7*24*60*60*1000)}});

  res.cookie("access_token",access,{httpOnly:true,secure:true,sameSite:"none",maxAge:15*60*1000});
  res.cookie("refresh_token",refresh,{httpOnly:true,secure:true,sameSite:"none",maxAge:(remember?30:7)*24*60*60*1000});
  return res.json({success:true,user:{id:user.id,username:user.username,email:user.email,name:user.name,role:user.role,status:user.status,department:user.departmentId,lastLoginAt:user.lastLoginAt}});
});

app.post("/api/auth/refresh",async(req,res)=>{
  const token=req.cookies.refresh_token;
  if(!token) return res.status(401).json({message:"No refresh token"});
  try{
    const p:any=jwt.verify(token,REFRESH_SECRET);
    const sessions=await prisma.session.findMany({where:{userId:p.sub,expiresAt:{gt:new Date()}}});
    let valid=false;
    for(const s of sessions) if(await bcrypt.compare(token,s.refreshHash)){valid=true;break;}
    if(!valid) return res.status(401).json({message:"Invalid refresh session"});
    const user=await prisma.user.findUnique({where:{id:p.sub}});
    if(!user || user.status!==UserStatus.ACTIVE) return res.status(401).json({message:"Account unavailable"});
    res.cookie("access_token",signAccess({id:user.id,role:user.role}),{httpOnly:true,secure:true,sameSite:"none",maxAge:15*60*1000});
    return res.json({success:true});
  }catch{return res.status(401).json({message:"Invalid refresh token"});}
});

app.post("/api/auth/logout",auth,async(req:AuthRequest,res)=>{
  await prisma.session.deleteMany({where:{userId:req.user!.id}});
  await prisma.activityLog.create({data:{userId:req.user!.id,action:"LOGOUT",description:"Logout",ipAddress:ip(req),userAgent:req.headers["user-agent"]}});
  res.clearCookie("access_token",{httpOnly:true,secure:true,sameSite:"none"});
  res.clearCookie("refresh_token",{httpOnly:true,secure:true,sameSite:"none"});
  res.json({success:true});
});

app.get("/api/me",auth,async(req:AuthRequest,res)=>{
  const u=await prisma.user.findUnique({where:{id:req.user!.id}});
  if(!u) return res.status(404).json({message:"User not found"});
  res.json({user:{id:u.id,username:u.username,email:u.email,name:u.name,phone:u.phone,role:u.role,status:u.status,department:u.departmentId,lastLoginAt:u.lastLoginAt}});
});

app.get("/api/dashboard",auth,requireRole("SUPER_ADMIN","ADMIN","MANAGER"),async(req,res)=>{
  const [totalUsers,activeUsers,inactiveUsers,totalStaff,departments,todaysActivity,pendingItems,activities]=await Promise.all([
    prisma.user.count(),
    prisma.user.count({where:{status:"ACTIVE"}}),
    prisma.user.count({where:{status:"INACTIVE"}}),
    prisma.staff.count(),
    prisma.department.count(),
    prisma.activityLog.count({where:{createdAt:{gte:new Date(new Date().setHours(0,0,0,0))}}}),
    prisma.record.count({where:{status:"PENDING"}}),
    prisma.activityLog.findMany({take:10,orderBy:{createdAt:"desc"},include:{user:{select:{username:true,name:true}}}})
  ]);
  res.json({data:{
    totalUsers,activeUsers,inactiveUsers,totalStaff,departments,todaysActivity,pendingItems,systemStatus:"Online",
    recentActivity:activities.map(a=>({id:a.id,action:a.action,description:a.description,user:a.user?.name||a.user?.username||"System",ipAddress:a.ipAddress,createdAt:a.createdAt}))
  }});
});

app.get("/api/users",auth,requireRole("SUPER_ADMIN","ADMIN"),async(req,res)=>{
  const users=await prisma.user.findMany({orderBy:{createdAt:"desc"},select:{id:true,username:true,email:true,name:true,phone:true,role:true,status:true,departmentId:true,createdAt:true,lastLoginAt:true}});
  res.json({data:users});
});

app.post("/api/users",auth,requireRole("SUPER_ADMIN","ADMIN"),async(req:AuthRequest,res)=>{
  const parsed=z.object({username:z.string().min(3),email:z.string().email(),name:z.string().optional(),password:z.string().min(8),role:z.nativeEnum(RoleName).default(RoleName.USER)}).safeParse(req.body);
  if(!parsed.success) return res.status(400).json({message:"Invalid user data"});
  const existing=await prisma.user.findFirst({where:{OR:[{email:parsed.data.email},{username:parsed.data.username}]}});
  if(existing) return res.status(409).json({message:"Username or email already exists"});
  const passwordHash=await bcrypt.hash(parsed.data.password,12);
  const u=await prisma.user.create({data:{...parsed.data,passwordHash,role:parsed.data.role}});
  await prisma.activityLog.create({data:{userId:req.user!.id,action:"CREATE",description:`Created user ${u.username||u.email}`,ipAddress:ip(req),userAgent:req.headers["user-agent"]}});
  res.status(201).json({user:{id:u.id,username:u.username,email:u.email,name:u.name,role:u.role,status:u.status}});
});

app.put("/api/users/:id",auth,requireRole("SUPER_ADMIN","ADMIN"),async(req:AuthRequest,res)=>{
  const data:any={};
  if(req.body.status) data.status=req.body.status;
  if(req.body.name!==undefined) data.name=req.body.name;
  if(req.body.email!==undefined) data.email=req.body.email;
  if(req.body.role) data.role=req.body.role;
  if(req.body.password) data.passwordHash=await bcrypt.hash(req.body.password,12);
  const u=await prisma.user.update({where:{id:String(req.params.id)},data});
  await prisma.activityLog.create({data:{userId:req.user!.id,action:"UPDATE",description:`Updated user ${u.username||u.email}`,ipAddress:ip(req),userAgent:req.headers["user-agent"]}});
  res.json({user:{id:u.id,username:u.username,email:u.email,name:u.name,role:u.role,status:u.status}});
});

app.delete("/api/users/:id",auth,requireRole("SUPER_ADMIN","ADMIN"),async(req:AuthRequest,res)=>{
  if(req.params.id===req.user!.id) return res.status(400).json({message:"You cannot delete your own account"});
  const u=await prisma.user.delete({where:{id:String(req.params.id)}});
  await prisma.activityLog.create({data:{userId:req.user!.id,action:"DELETE",description:`Deleted user ${u.username||u.email}`,ipAddress:ip(req),userAgent:req.headers["user-agent"]}});
  res.json({success:true});
});

app.use((err:any,_req:Request,res:Response,_next:NextFunction)=>{
  console.error(err);
  res.status(500).json({message:"Internal server error"});
});

app.listen(PORT,()=>console.log(`API listening on ${PORT}`));
