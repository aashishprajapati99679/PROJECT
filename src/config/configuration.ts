export default () => ({
    port: Number(process.env.PORT || 3000),

    database: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    },

    redis: {
        url: process.env.REDIS_URL,
    },

    otp: {
        secret: process.env.OTP_SECRET,
    },

    sms: {
        baseUrl: process.env.SMS_BASE_URL,
        apiKey: process.env.SMS_API_KEY,
        senderId: process.env.SMS_SENDER_ID,
        templateId: process.env.SMS_DLT_TEMPLATE_ID,
        route: process.env.SMS_ROUTE,
        flashSms: process.env.SMS_FLASH_SMS,
        dcs: process.env.SMS_DCS,
        channel: process.env.SMS_CHANNEL,
    },
});