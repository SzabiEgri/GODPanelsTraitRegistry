async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    //Change name here
    const Registry = await ethers.getContractFactory("GODPanelsRegistry");
    const registry = await Registry.deploy();
  
    console.log("Token address:", registry.address);
  } 
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });