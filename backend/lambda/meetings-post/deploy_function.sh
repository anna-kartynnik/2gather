#!/bin/sh

lambda_name="2gather-meetings-post"
zip_file="${lambda_name}.zip"
role_arn="arn:aws:iam::417896080938:role/lambda-vpc-execution-role"


files="index.js ../common.js ../meetings.js"
chmod -R 755 ${files}
zip -r "${zip_file}"  ../../node_modules  $files

lambda_dir=$PWD
zip "${zip_file}" index.js
cd ..
zip "${lambda_dir}/${zip_file}" common.js meetings.js
cd ..
zip -r "${lambda_dir}/${zip_file}" node_modules

# [TODO] get env from config or .env.development?
# Loop through arguments and process them
for arg in "$@"
do
    case $arg in
        -c|--create)
        echo "Creating lambda function"
        aws lambda create-function \
            --region "us-east-1" \
            --function-name "${lambda_name}" \
            --zip-file "fileb://${lambda_dir}/${zip_file}" \
            --role "${role_arn}" \
            --handler "index.handler" \
            --runtime nodejs14.x \
            --timeout 60 \
            --vpc-config SubnetIds="subnet-08a784f387327402e,subnet-0795c916d194c39fc,subnet-0e4bdc97aa3c0aec3,subnet-05c9a820f2d812637,subnet-0e254471ce9088ff2,subnet-0a77ad7cead376913",SecurityGroupIds="sg-083ef3c6766044666" \
            --environment Variables="{PGHOST=twogather.chq5c6qlivtp.us-east-1.rds.amazonaws.com,PGPORT=5432,PGDATABASE=twogather,PGUSER=postgres,PGPASSWORD=N8YlIqcU6zLZrG}" \
            --profile uni
        ;;
        -u|--update)
        echo "Updating lambda function"
        aws lambda update-function-code \
            --function-name "${lambda_name}" \
            --zip-file "fileb://${lambda_dir}/${zip_file}" \
            --profile uni
        ;;
    esac
done

