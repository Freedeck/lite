import { universal } from "../../shared/universal.js";

await universal.init("Main:Login");

universal.send(universal.events.login.login_data, {
  tlid: universal._information.tempLoginID,
});
