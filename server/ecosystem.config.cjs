module.exports = {
  apps: [
    {
      name: "rentiful",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development",
        NODE_EXTRA_CA_CERTS: "/etc/ssl/aws/rds-combined-ca-bundle.pem",
      },
    },
  ],
};
