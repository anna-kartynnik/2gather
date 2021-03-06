/*
 * Copyright 2010-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

var apigClientFactory = {};
apigClientFactory.newClient = function (config) {
    var apigClient = { };
    if(config === undefined) {
        config = {
            accessKey: '',
            secretKey: '',
            sessionToken: '',
            region: '',
            apiKey: undefined,
            defaultContentType: 'application/json',
            defaultAcceptType: 'application/json'
        };
    }
    if(config.accessKey === undefined) {
        config.accessKey = '';
    }
    if(config.secretKey === undefined) {
        config.secretKey = '';
    }
    if(config.apiKey === undefined) {
        config.apiKey = '';
    }
    if(config.sessionToken === undefined) {
        config.sessionToken = '';
    }
    if(config.region === undefined) {
        config.region = 'us-east-1';
    }
    //If defaultContentType is not defined then default to application/json
    if(config.defaultContentType === undefined) {
        config.defaultContentType = 'application/json';
    }
    //If defaultAcceptType is not defined then default to application/json
    if(config.defaultAcceptType === undefined) {
        config.defaultAcceptType = 'application/json';
    }

    
    // extract endpoint and path from url
    var invokeUrl = 'https://teu4z70109.execute-api.us-east-1.amazonaws.com/dev';
    var endpoint = /(^https?:\/\/[^\/]+)/g.exec(invokeUrl)[1];
    var pathComponent = invokeUrl.substring(endpoint.length);

    var sigV4ClientConfig = {
        accessKey: config.accessKey,
        secretKey: config.secretKey,
        sessionToken: config.sessionToken,
        serviceName: 'execute-api',
        region: config.region,
        endpoint: endpoint,
        defaultContentType: config.defaultContentType,
        defaultAcceptType: config.defaultAcceptType
    };

    var authType = 'NONE';
    if (sigV4ClientConfig.accessKey !== undefined && sigV4ClientConfig.accessKey !== '' && sigV4ClientConfig.secretKey !== undefined && sigV4ClientConfig.secretKey !== '') {
        authType = 'AWS_IAM';
    }

    var simpleHttpClientConfig = {
        endpoint: endpoint,
        defaultContentType: config.defaultContentType,
        defaultAcceptType: config.defaultAcceptType
    };

    var apiGatewayClient = apiGateway.core.apiGatewayClientFactory.newClient(simpleHttpClientConfig, sigV4ClientConfig);
    
    apigClient.calendarsGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['user_id'], ['body']);
        
        var calendarsGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/calendars').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, ['user_id']),
            body: body
        };
        
        return apiGatewayClient.makeRequest(calendarsGetRequest, authType, additionalParams, config.apiKey);
    };    
    
    apigClient.calendarsPost = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['body'], ['body']);
        
        var calendarsPostRequest = {
            verb: 'post'.toUpperCase(),
            path: pathComponent + uritemplate('/calendars').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(calendarsPostRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.calendarsOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var calendarsOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/calendars').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(calendarsOptionsRequest, authType, additionalParams, config.apiKey);
    };

    apigClient.meetingsGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }

        let paramsToQS = ['user_id'];
        if (params.status) {
            paramsToQS.push('status');
        }
        
        apiGateway.core.utils.assertParametersDefined(params, paramsToQS, ['body']);
        
        var meetingsGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/meetings').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, paramsToQS),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(meetingsGetRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.meetingsPost = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['body'], ['body']);
        
        var meetingsPostRequest = {
            verb: 'post'.toUpperCase(),
            path: pathComponent + uritemplate('/meetings').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(meetingsPostRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.meetingsOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var meetingsOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/meetings').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(meetingsOptionsRequest, authType, additionalParams, config.apiKey);
    };


    apigClient.meetingsProposedTimeIdVotesPost = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }

                console.log(params);
        console.log(body);
        
        apiGateway.core.utils.assertParametersDefined(params, ['id'], ['body']);
        
        var meetingsProposedTimeIdVotesPostRequest = {
            verb: 'post'.toUpperCase(),
            path: pathComponent + uritemplate('/meetings/proposed-time/{id}/votes').expand(apiGateway.core.utils.parseParametersToObject(params, ['id'])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(meetingsProposedTimeIdVotesPostRequest, authType, additionalParams, config.apiKey);
    };

    apigClient.meetingsProposedTimeIdVotesDelete = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['id'], ['body']);
        
        var meetingsProposedTimeIdVotesDeleteRequest = {
            verb: 'delete'.toUpperCase(),
            path: pathComponent + uritemplate('/meetings/proposed-time/{id}/votes').expand(apiGateway.core.utils.parseParametersToObject(params, ['id'])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(meetingsProposedTimeIdVotesDeleteRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.meetingsProposedTimeIdVotesOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var meetingsProposedTimeIdVotesOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/meetings/proposed-time/{id}/votes').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(meetingsProposedTimeIdVotesOptionsRequest, authType, additionalParams, config.apiKey);
    };


    apigClient.meetingsIdPut = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }

        console.log(params);
        
        apiGateway.core.utils.assertParametersDefined(params, ['id'], ['body']);
        
        var meetingsIdPutRequest = {
            verb: 'put'.toUpperCase(),
            path: pathComponent + uritemplate('/meetings/{id}').expand(apiGateway.core.utils.parseParametersToObject(params, ['id'])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(meetingsIdPutRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.meetingsIdDelete = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['id'], ['body']);

        console.log(uritemplate('/meetings/{id}').expand(apiGateway.core.utils.parseParametersToObject(params, ['id'])));
        
        var meetingsIdDeleteRequest = {
            verb: 'delete'.toUpperCase(),
            path: pathComponent + uritemplate('/meetings/{id}').expand(apiGateway.core.utils.parseParametersToObject(params, ['id'])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(meetingsIdDeleteRequest, authType, additionalParams, config.apiKey);
    };


    apigClient.meetingsIdGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['id', 'user_id'], ['body']);

        console.log(uritemplate('/meetings/{id}').expand(apiGateway.core.utils.parseParametersToObject(params, ['id'])));
        
        var meetingsIdGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/meetings/{id}').expand(apiGateway.core.utils.parseParametersToObject(params, ['id'])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, ['user_id']),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(meetingsIdGetRequest, authType, additionalParams, config.apiKey);
    };

    apigClient.meetingsIdReschedulePost = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }

        console.log(params);
        
        apiGateway.core.utils.assertParametersDefined(params, ['id'], ['body']);
        
        var meetingsIdPutRequest = {
            verb: 'post'.toUpperCase(),
            path: pathComponent + uritemplate('/meetings/{id}/reschedule').expand(apiGateway.core.utils.parseParametersToObject(params, ['id'])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(meetingsIdPutRequest, authType, additionalParams, config.apiKey);
    };


    apigClient.meetingsIdConfirmPost = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }

                console.log(params);
        console.log(body);
        
        apiGateway.core.utils.assertParametersDefined(params, ['id'], ['body']);
        
        var meetingsProposedTimeIdVotesPostRequest = {
            verb: 'post'.toUpperCase(),
            path: pathComponent + uritemplate('/meetings/{id}/confirm').expand(apiGateway.core.utils.parseParametersToObject(params, ['id'])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(meetingsProposedTimeIdVotesPostRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.usersGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['email'], ['body']);
        
        var usersGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/users').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, ['email']),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(usersGetRequest, authType, additionalParams, config.apiKey);
    };

    apigClient.usersPost = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['body'], ['body']);
        
        var usersPostRequest = {
            verb: 'post'.toUpperCase(),
            path: pathComponent + uritemplate('/users').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(usersPostRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.usersOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var usersOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/users').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(usersOptionsRequest, authType, additionalParams, config.apiKey);
    };

    apigClient.participantsGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['creator_id'], ['body']);
        
        var participantsGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/participants').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, ['creator_id']),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(participantsGetRequest, authType, additionalParams, config.apiKey);
    };

    apigClient.meetingsIdQuestionsGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['id', 'user_id'], ['body']);
        
        var meetingsIdQuestionsGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/meetings/{id}/questions').expand(apiGateway.core.utils.parseParametersToObject(params, ['id'])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, ['user_id']),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(meetingsIdQuestionsGetRequest, authType, additionalParams, config.apiKey);
    };

    apigClient.meetingsIdQuestionsPost = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['id'], ['body']);
        
        var meetingsIdQuestionsPostRequest = {
            verb: 'post'.toUpperCase(),
            path: pathComponent + uritemplate('/meetings/{id}/questions').expand(apiGateway.core.utils.parseParametersToObject(params, ['id'])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(meetingsIdQuestionsPostRequest, authType, additionalParams, config.apiKey);
    };

    apigClient.meetingsIdQuestionsDelete = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['id', 'question_id'], ['body']);
        
        var meetingsIdQuestionsDeleteRequest = {
            verb: 'delete'.toUpperCase(),
            path: pathComponent + uritemplate('/meetings/{id}/questions/{question_id}').expand(
                apiGateway.core.utils.parseParametersToObject(params, ['id', 'question_id'])
            ),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(meetingsIdQuestionsDeleteRequest, authType, additionalParams, config.apiKey);
    };

    apigClient.meetingsIdQuestionIdVotesPost = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['id', 'question_id'], ['body']);
        
        var meetingsIdQuestionIdVotesPostRequest = {
            verb: 'post'.toUpperCase(),
            path: pathComponent + uritemplate('/meetings/{id}/questions/{question_id}/votes').expand(
                apiGateway.core.utils.parseParametersToObject(params, ['id', 'question_id'])
            ),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(meetingsIdQuestionIdVotesPostRequest, authType, additionalParams, config.apiKey);
    };

    apigClient.meetingsIdQuestionIdVotesDelete = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['id', 'question_id', 'vote_id'], ['body']);
        
        var meetingsIdQuestionIdVotesDeleteRequest = {
            verb: 'delete'.toUpperCase(),
            path: pathComponent + uritemplate('/meetings/{id}/questions/{question_id}/votes/{vote_id}').expand(
                apiGateway.core.utils.parseParametersToObject(params, ['id', 'question_id', 'vote_id'])
            ),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(meetingsIdQuestionIdVotesDeleteRequest, authType, additionalParams, config.apiKey);
    };

    apigClient.uploadPut = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['Content-Type', 'x-amz-meta-filename'], ['body']);
        
        var uploadPutRequest = {
            verb: 'put'.toUpperCase(),
            path: pathComponent + uritemplate('/upload').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, ['Content-Type', 'x-amz-meta-filename']),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(uploadPutRequest, authType, additionalParams, config.apiKey);
    };

    apigClient.notificationsGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }

        let paramsToQS = ['user_id'];
        
        apiGateway.core.utils.assertParametersDefined(params, paramsToQS, ['body']);
        
        var notificationsGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/notifications').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, paramsToQS),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(notificationsGetRequest, authType, additionalParams, config.apiKey);
    };

    apigClient.notificationsPut = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }

        console.log(params);
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var notificationsPutRequest = {
            verb: 'put'.toUpperCase(),
            path: pathComponent + uritemplate('/notifications').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(notificationsPutRequest, authType, additionalParams, config.apiKey);
    };
    

    return apigClient;
};
