const { expect } = require("chai");


describe("GODPanelsRegistry contract", function () {
  let GODPanelsRegistry;
  let hardhatGODPanelsRegistry;
  let owner;
  let addr1;
  let addr2;


  beforeEach(async function () {
    GODPanelsRegistry = await ethers.getContractFactory("GODPanelsRegistry");
    [owner, addr1,addr2] = await ethers.getSigners();
    hardhatGODPanelsRegistry = await GODPanelsRegistry.deploy();
  });

  
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await hardhatGODPanelsRegistry.owner()).to.equal(owner.address);
    });
    it("Should add owner to admins", async function(){
      expect(await hardhatGODPanelsRegistry.admins(owner.address)).to.equal(true)
    });
  });

  describe("Saving DNA", function () {
    it("Should assign dna to given token ID", async function () {
        await hardhatGODPanelsRegistry.save_DNA(25,"0154")
        const test = await hardhatGODPanelsRegistry.dnaMappings[25];
        expect(test === ("0154"))
    });

    it ("Should not accept transactions from other addresses other than owner", async function (){

        await expect(hardhatGODPanelsRegistry.connect(addr1).save_DNA(25,"0154")
        ).to.be.revertedWith("You don't have authorization to set DNA");
    });

    it ("Should not accept DNA that is to long", async function (){
        await expect(hardhatGODPanelsRegistry.save_DNA(24,"55555")
        ).to.be.revertedWith("Invalid DNA");
        
    });
    it ("Should not accept DNA that is to short", async function (){
      await expect(hardhatGODPanelsRegistry.save_DNA(24,"bas")
      ).to.be.revertedWith("Invalid DNA");
      
  });
    it("Should not accept DNA containing special characters", async function(){
      await expect(hardhatGODPanelsRegistry.save_DNA(24,"*bas")
      ).to.be.revertedWith("Invalid DNA");
    });

    
    it ("Should not update already existing entries", async function (){
        await hardhatGODPanelsRegistry.save_DNA(25,"0154")
        await expect(hardhatGODPanelsRegistry.save_DNA(25,"5555")
        ).to.be.revertedWith("DNA already set for this token ID");
    });

    it ("Should not update tokens outside of specified range", async function (){
        await expect(hardhatGODPanelsRegistry.save_DNA(11111,"5555")
        ).to.be.revertedWith("Invalid tokenId");
        await expect(hardhatGODPanelsRegistry.save_DNA(0,"5555")
        ).to.be.revertedWith("Invalid tokenId");
    });

    
  });

  describe("Getting DNA information", function(){
    it("Should return correct DNA of existing tokenID", async function (){
      await hardhatGODPanelsRegistry.save_DNA(24,"1234")
      expect(await hardhatGODPanelsRegistry.connect(addr1).dnaMappings(24)).to.equal("1234")
    });
    it("Should do nothing to non existing tokenID", async function(){
      expect(await hardhatGODPanelsRegistry.dnaMappings(25)).to.equal("")
    })
  });
  describe("Admins and owner manipulation", function(){
    it("Owner should be able to transfer ownership", async function(){
      expect(await hardhatGODPanelsRegistry.owner()).to.equal(owner.address)
      await hardhatGODPanelsRegistry.transfer_owner(addr1.address)
      expect(await hardhatGODPanelsRegistry.owner()).to.equal(addr1.address)
      expect(await hardhatGODPanelsRegistry.admins(addr1.address)).to.equal(true)
    });
    it("Non-owner should not be abel to transfer ownershipt", async function(){
      await expect(hardhatGODPanelsRegistry.connect(addr1).transfer_owner(addr1.address)
      ).to.be.revertedWith("You don't have authorization to transfer ownership")   
    })
    it("Owner should be able to add new admins", async function(){
      await hardhatGODPanelsRegistry.add_admin(addr1.address)
      expect(await hardhatGODPanelsRegistry.admins(addr2.address)).to.equal(false)
      expect(await hardhatGODPanelsRegistry.admins(addr1.address)).to.equal(true)
    })
    it("Non-owner should not be able to add new admins", async function(){
      await expect(hardhatGODPanelsRegistry.connect(addr1).add_admin(addr1.address)
      ).to.be.revertedWith("You don't have authorization to add admins")
    })
    it("New admins should be able to save DNA", async function(){
      await hardhatGODPanelsRegistry.add_admin(addr1.address)
      expect(await hardhatGODPanelsRegistry.dnaMappings(12)).to.equal("")
      await hardhatGODPanelsRegistry.connect(addr1).save_DNA(12,"1234")
      expect(await hardhatGODPanelsRegistry.dnaMappings(12)).to.equal("1234")
    })
    it("Owner should be able to remove admins", async function(){
      await hardhatGODPanelsRegistry.add_admin(addr1.address)
      expect(await hardhatGODPanelsRegistry.admins(addr1.address)).to.equal(true)
      await hardhatGODPanelsRegistry.remove_admin(addr1.address)
      expect(await hardhatGODPanelsRegistry.admins(addr1.address)).to.equal(false)
    })
    it("Non-owner should not be able to remove admins", async function(){
      await hardhatGODPanelsRegistry.add_admin(addr1.address)
      await expect(hardhatGODPanelsRegistry.connect(addr2).remove_admin(addr1.address)
      ).to.be.revertedWith("You don't have authorization to remove admins")
    })
    it("Admin role of owner should not be removable", async function(){
      await expect(hardhatGODPanelsRegistry.remove_admin(owner.address)
      ).to.be.revertedWith("Cant rewoke admin role of owner")
    })
  });
});

