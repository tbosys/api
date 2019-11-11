const KeenTracking = require("keen-tracking");

let keenClient = null;

if (!keenClient) {
  // This is your actual Project ID and Write Key
  keenClient = new KeenTracking({
    projectId: "5c8811ddc9e77c0001eded5f",
    writeKey:
      "206DFDFFC651F5BB8F0986F5A8CC28A47C8FA0F385D6D9FA9AFDD7E3C5824935583F2CCEAF90B70ADF0F3C1882311C84F441029C778D43068A1BBC663D7D4A07929896B401A9FA698604ECAD46C1A1998FD49DEB4BCF12AE479A24D7FAEC99F3"
  });
}

module.exports = keenClient;
