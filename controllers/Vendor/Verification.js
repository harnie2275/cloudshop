const { StatusCodes } = require("http-status-codes");
const asyncHandler = require("express-async-handler");
const { v4: UUID } = require('uuid');
const SIDCore = require('smile-identity-core');
const { verificationValidator } = require("../../utils/validator");
const { respondWithError } = require("../../utils/response");
const SIDSignature = SIDCore.Signature;
const SIDWebAPI = SIDCore.WebApi;

exports.uploadData = asyncHandler(async (req, res, next) => {
    // console.log(req.body);
    // try {
        const vendor = req.vendor;
        const { images, partner_params: { libraryVersion } } = req.body;

        const { error } = verificationValidator({
            images: images,
            // partner_params: partner_params,
        });

        if (error) {
            return respondWithError(
                res,
                {},
                error.details?.[0].message,
                StatusCodes.BAD_REQUEST
            );
        }

        const { PARTNER_ID, API_KEY, SID_SERVER } = process.env;
        const connection = new SIDWebAPI(
            PARTNER_ID,
            '/callback',
            API_KEY,
            SID_SERVER
        );

        const partner_params_from_server = {
            user_id: vendor._id,
            job_id: `job-${UUID()}`,
            job_type: 1
        };


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
       return res.json(result);
    // } catch (e) {
    //     console.error(e);
    // }
})