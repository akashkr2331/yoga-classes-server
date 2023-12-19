const express = require("express")
require("dotenv").config()
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST)
const bodyParser = require("body-parser")
const cors = require("cors")
// const https = require("https"); 
// const fs = require("fs");   
const mongoose=require("mongoose")
const User=require("./models/user")

const app = express()

app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())

app.use(cors())

mongoose.set('strictQuery', true);

const dbUrl = process.env.dbUrl;
mongoose.connect(dbUrl)

// mongoose.connect('mongodb://127.0.0.1:27017/yogaClasses');

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connectin error:"));
db.once("open",()=>{
    console.log("Datbase connected");
})

app.post("/payment", cors(), async (req, res)=>{
    let { id} = req.body

    try {
        const payment = await stripe.paymentIntents.create({
            amount:400,
            currency: "INR",
            description: "Payment",
            payment_method: id,
            confirm: true,
            return_url: 'http://localhost:3000',
        })

        console.log("Payment", payment)
        res.json({
            message: payment,
            success: true
        })
    } catch (error) {
        console.log("Error", error)
        res.json({
            message: "Payment Failed",
            success: false
        })
    }
})

app.post('/userdata',async(req,res)=>{
    try{
        const {name,dob,mob,slot}=req.body;
        console.log(name,dob,mob,slot);
        // const user=User.find({name:'dds'})
        const d = new Date();
        let month = d.getMonth();
        const find=await User.findOne({mob:mob });
        console.log(find);

        if(find==null){
            
            let slotarr=["","","","","","","","","","","",""]
            let paymentarr=[0,0,0,0,0,0,0,0,0,0,0,0]
            slotarr[month]=slot;
            console.log(slotarr,paymentarr)
            const newuser=new User({
                name,dob,mob,slot:slotarr,payment:paymentarr
            });
            console.log(newuser)
            const user=await newuser.save();
            
            res.send("not paid")
        }
        else{
            console.log(find.payment[month])
            if(find.payment[month]){
                res.send("Paid")
            }
            else{
                console.log(find.slot[month])
                // find.slot[month]=slot;
                let slotarr=["","","","","","","","","","","",""]
                slotarr[month]=slot;
                const filter = { mob: mob };
const update = { slot: slotarr,name:name,dob:dob };

// `doc` is the document _before_ `update` was applied
let doc = await User.findOneAndUpdate(filter, update);
console.log(doc)
                res.send("not paid");
            }
        }
        
    }
    catch (err) {
        res.status(404).json({ message: err.message });
      }

})

app.post('/savepayment',async(req,res)=>{
    try{
        const{mob}=req.body;
        console.log(mob)
        // const user=User.findOne({mob:mob});
        const d = new Date();
        let month = d.getMonth();
        let paymentarr=[0,0,0,0,0,0,0,0,0,0,0,0]
        paymentarr[month]=true;
        console.log(paymentarr)
        const filter = { mob: mob };
const update = { payment: paymentarr};

// `doc` is the document _before_ `update` was applied
let doc = await User.findOneAndUpdate(filter, update);
console.log(doc)
res.send("data stored");
    }
    catch (err) {
        res.status(404).json({ message: err.message });
      }
})

const options = { 
    // key: fs.readFileSync("server.key"), 
    // cert: fs.readFileSync("server.cert"), 
    key: "server key", 
    cert: "server certificate", 
  }; 
    
  // Creating https server by passing 
  // options and app object 
//   https.createServer(function (req, res) {
//     res.writeHead(200, {'Content-Type': 'text/plain'});
//     res.write('Hello World!');
//     res.end();
//   })
  app.listen(4000, ()=>{
    console.log("Server is running")
})