const { StatusCodes } = require("http-status-codes");
const asyncHandler = require("express-async-handler");
const { v4: UUID } = require('uuid');
const SIDCore = require('smile-identity-core');
const SIDSignature = SIDCore.Signature;
const SIDWebAPI = SIDCore.WebApi;

exports.uploadData = asyncHandler(async (req, res, next) => {
    console.log(req.body);

    try {
        const { PARTNER_ID, API_KEY, SID_SERVER } = process.env;
        const connection = new SIDWebAPI(
            PARTNER_ID,
            '/callback',
            API_KEY,
            SID_SERVER
        );

        const partner_params_from_server = {
            user_id: `user-${UUID()}`,
            job_id: `job-${UUID()}`,
            job_type: 1
        };

        const { images, partner_params: { libraryVersion } } = req.body;

        const options = {
            return_job_status: true
        };

        const partner_params = Object.assign({}, partner_params_from_server, { libraryVersion });


        const result = await connection.submit_job(
            partner_params,
            images,
            {},
            options
        );

        res.json(result);
    } catch (e) {
        console.error(e);
    }
})