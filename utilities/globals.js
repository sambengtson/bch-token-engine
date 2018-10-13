exports.isProduction = () => {
    return process.env.production === "true";
}