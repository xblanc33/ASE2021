import UsageProfile from "./UsageProfile";
import fs from "fs";
import Action from "./Action";
import UsagePath from "./UsagePath";

export function createUsageProfileFromJSONFile(filePath : string, withValue : boolean = true) : UsageProfile{
    const rawdata = fs.readFileSync(filePath,"utf-8");
    const run : {
        explorationList:{
            testerName:string,
            interactionList:{
                concreteType:string, 
                kind:string, 
                value:string
            }[]
        }[]
    } = JSON.parse(rawdata);

    const usageProfile = new UsageProfile();
    run.explorationList.forEach(exploration => {
        //const actions = exploration.interactionList.filter(interaction => interaction.kind !== "start" && interaction.kind !== "end").filter(interaction => interaction.concreteType === "Action")
        const actions = exploration.interactionList.filter(interaction => interaction.concreteType === "Action").map( action => {
            if (withValue) {
                return new Action(action.value?action.kind+'$'+action.value:action.kind);
            } else {
                return new Action(action.kind);
            }
        });
        const usagePath = new UsagePath(actions, exploration.testerName);
        usageProfile.addUsagePath(usagePath);
    });
    return usageProfile;
}

export function createUsageProfileFromDirecory(directoryPath : string, withValue : boolean = true) : UsageProfile{
    const files = fs.readdirSync(directoryPath);
    const usageProfile = new UsageProfile();
    files.forEach(file => {
        const filePath = directoryPath+"/"+file;
        const usageProfileFromFile = createUsageProfileFromJSONFile(filePath, withValue);
        usageProfileFromFile.paths.forEach(path => {
            usageProfile.addUsagePath(path);
        });
    });
    return usageProfile;
}
