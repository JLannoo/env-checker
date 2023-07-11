export function getUserPackageManager(){
    const packageManager = process.env.npm_config_user_agent;
    
    if(packageManager?.includes("yarn")) return "yarn";
    if(packageManager?.includes("pnpm")) return "pnpm";

    return "npm";
}