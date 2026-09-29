export default () => ({
    port: Number(process.env.PORT) || 3333,
    jwtSecret: process.env.JWT_SECRET || 'defaultSecret',
    environment: process.env.NODE_ENV || 'development',
});
