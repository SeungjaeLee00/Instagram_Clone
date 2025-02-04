const swaggerJsdoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Instagram Clone API",
      version: "1.0.0",
      description: "Instagram 클론 프로젝트 API 문서",
    },
    servers: [
      {
        url: "https://instagram-clone-ztsr.onrender.com",
      },
    ],
  },

  apis: ["./routes/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
