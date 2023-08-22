const User = require("../model/user")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const multer = require('multer')

  //------------user registration---------//

  const userRegister = async(req,res)=>{
    try {
        const emailExist = await User.findOne({email:req.body.email})
        //email exist checking
        if(emailExist){
            return res.status(400).json({
                message:'User already exists'
            });
        }else{
            const hashPassword = await bcrypt.hash(req.body.password,10)

            const user = new User({
                name:req.body.name,
                email:req.body.email,
                password:hashPassword
            })
            const result = await user.save()

            //JWT token

            const{_id}=await user.save()
            const token = jwt.sign({_id:_id},"secret")

            res.cookie("jwt",token,{
                httpOnly:true,
                maxAge:24*60*60*1000

            })
            res.json({
                user:result
            })
        }
        
    } catch (error) {
        
        console.log(error.message);
        res.status(500).json({
            message:'Internal Server error'
        })
    }
  }

  //------------user login verification----//

  const userLogin = async(req,res)=>{
    try {
        console.log(req.body.email,req.body.password);
        const user = await User.findOne({email:req.body.email});
        if(!user){
            return res.status(404).json({
                message:'User not found'
            })
        }
        console.log(user);
        if(user && !(await bcrypt.compare(req.body.password,user.password))){
            return res.status(400).json({
                message:'Password is incorrect'
            })
        }

        const token = jwt.sign({_id:user._id},"secret")
        res.cookie('jwt',token,{
            httpOnly:true,
            maxAge:24*60*60*1000
        })
        res.send({
            message:"success"
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message:'Internal servor error'
        });
        
        
    }
  }

  //---------------user authorised checking-----//

  const userAuthorise = async(req,res)=>{
    try {
        const cookie = req.cookies["jwt"]
        const claim = jwt.verify(cookie,"secret")
        console.log(claim);

        if(!claim){
            return res.status(404).send({
                message:"unauthenticated"
            })
        }
        const user = await User.findOne({_id:claim._id})
        const {password,...data} = await user.toJSON();
        res.send(data)
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message:'unauthoriser'
        })
    }
  }

  //----------------User profile-----------//

  const userProfile =async(req,res)=>{
    try {
        const cookie =req.cookies['jwt'];
        const claims = jwt.verify(cookie,"secret")

        if(!claims){
            return res.status(400).json({
                message:'user not authenticated'
            });
        }
        console.log(req.file.filename);
        const imageadd =await User.updateMany({_id:claims._id},{$set:{image:req.file.filename}})
        if(imageadd){
            return res.status(200).json({
                message:'image successfully added'
            });
        }else{
            return response.status(400).json({
                message:'something went wrong'
            })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message:'internal server error'
        })
        
    }
  }

  //-----------user logout---------//
 const userLogout = async(req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0})
        res.send({
            message:'success'
        })
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message:"internal servor error"
        })
        
    }
 }






module.exports = {
    userRegister,
    userLogin,
    userAuthorise,
    userLogout ,
    userProfile 
   

}