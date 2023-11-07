module.exports = {
    secretKeyForCenter: process.env.SECRET_KEY_FOR_CENTER,
    refreshSecretKeyForCenter: process.env.REFRESH_SECRET_KEY_FOR_CENTER,
    
    secretKeyForVehicle: process.env.SECRET_KEY_FOR_VEHICLE,
    refreshSecretKeyForVehicle: process.env.REFRESH_SECRET_KEY_FOR_VEHICLE,

    secretKeyForIntersection: process.env.SECRET_KEY_FOR_INTERSECTION,

    tokenLife: process.env.TOKEN_LIFE,
    refreshTokenLife: process.env.REFRESH_TOKEN_LIFE,

    mapToken: process.env.MAP_ACCESS_TOKEN,

    initialLocation: process.env.INITIAL_LOCATION
}