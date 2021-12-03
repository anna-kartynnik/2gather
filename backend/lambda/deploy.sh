#!/usr/bin/env bash
# NAME corresponds to the target folder names (lambda names w/o prefixes)
readonly usage="Usage: $0 --{create|update} --name NAME COMMON_FILE [COMMON_FILE...]"

readonly DEFAULT_NAME_PREFIX='2gather-'
readonly DEFAULT_HANDLER='index.handler'
readonly DEFAULT_LAMBDA_RUNTIME='nodejs14.x'
readonly DEFAULT_LAMBDA_TIMEOUT=60

log() {
    echo "$@" >&2
}

die() {
    log "$@"
    exit 1
}

quiet() {
    "$@" > /dev/null 2>&1
}

abspath() {
    # Like `readlink -f` but works on macOS
    quiet pushd "$(dirname "$1")"
    echo "$PWD/$(basename "$1")"
    quiet popd
}

run() {
    # Uncomment for debugging. Comment out for privacy.
    # log "Running:" "$@"
    "$@"
}

readonly lambdas_root="$(dirname "$0")"
files=()
name=''
mode=''
while [ $# -ne 0 ]; do
    argument=$1
    shift
    case $argument in
        -h|--help) echo "$usage"; exit;;
        -n|--name) name=$1; shift || { log "-n/--name: missing argument"; die "$usage"; };;
        -c|--create) mode='create';;
        -u|--update) mode='update';;
        *) files+=("$lambdas_root/$argument");;
    esac
done

[ -n "$name" ] || die '--n/--name is required'
[ -n "$mode" ] || die 'Expected either -c/--create or -u/--update'

# Read deployment configuration.
. "$lambdas_root/../.env.aws" || exit 1
readonly LAMBDA_PREFIX=${LAMBDA_PREFIX-$DEFAULT_NAME_PREFIX}
readonly LAMBDA_RUNTIME=${LAMBDA_RUNTIME:-$DEFAULT_LAMBDA_RUNTIME}
readonly LAMBDA_TIMEOUT=${LAMBDA_TIMEOUT:-$DEFAULT_LAMBDA_TIMEOUT}

readonly lambda_name="$LAMBDA_PREFIX$name"
readonly lambda_directory="$lambdas_root/$name"
#files+=("$lambda_directory"/*.js "$lambdas_root/../node_modules")
files+=("$lambda_directory"/*.js)
readonly zip_file="$lambda_directory/$lambda_name.zip"

log "Lambda function name: $lambda_name"
log "Files: ${files[@]}"
log "Target archive: $zip_file"

readonly zip_file_abspath=$(abspath "$zip_file")
rm -f "$zip_file_abspath"
for file in "${files[@]}"; do
    quiet pushd "$(dirname "$file")"
    zip -r "$zip_file_abspath" "$(basename "$file")" ||
        die "Failed packing '$file' into '${zip_file}'"
    quiet popd
done

zip_file_url="fileb://$zip_file_abspath"

if [ "$mode" = 'create' ]; then
    # Exit on undefined VPC/PostgreSQL configuration.
    set -u
    readonly vpc_config="SubnetIds=$VPC_SUBNET_IDS,SecurityGroupIds=$VPC_SECURITY_GROUP_IDS"
    readonly postgres_config="{PGHOST=$PGHOST,PGPORT=$PGPORT,PGDATABASE=$PGDATABASE,PGUSER=$PGUSER,PGPASSWORD=$PGPASSWORD}"
    set +u

    log "Creating lambda function $lambda_name"
    run aws lambda create-function \
        --region "${AWS_REGION?'AWS region not configured'}" \
        --function-name "$lambda_name" \
        --zip-file "$zip_file_url" \
        --role "${VPC_LAMBDA_EXECUTION_ROLE_ARN?'AWS execution role ARN missing'}" \
        --handler "$DEFAULT_HANDLER" \
        --runtime "$LAMBDA_RUNTIME" \
        --timeout "$LAMBDA_TIMEOUT" \
        --layers "${LAMBDA_LAYERS}" \
        --vpc-config "$vpc_config" \
        --environment "Variables=$postgres_config" \
        --profile "$AWS_PROFILE" ||
            exit $?
elif [ "$mode" = 'update' ]; then
    log "Updating lambda function $lambda_name"
    run aws lambda update-function-code \
        --function-name "$lambda_name" \
        --zip-file "$zip_file_url" \
        --profile "$AWS_PROFILE" ||
            exit $?
else
    die "Internal error: unhandled mode '$mode'"
fi
