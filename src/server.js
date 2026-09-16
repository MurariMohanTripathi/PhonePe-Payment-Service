const app = require("./app");
const env = require("./config/env");

const startServer = ()=>{
    app.listen(env.port,()=>{
        console.log(`Payment Service running on PORT ${env.port}`);
        console.log(`Environment : ${env.phonepe.environment}`);
    });
};

startServer();