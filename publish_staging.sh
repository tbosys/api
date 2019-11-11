#!/bin/bash



aws lambda update-alias --function-name crm-master-api --name staging --function-version 11  --region us-east-1
aws lambda update-alias --function-name crm-master-api --name production --function-version 11  --region us-east-1