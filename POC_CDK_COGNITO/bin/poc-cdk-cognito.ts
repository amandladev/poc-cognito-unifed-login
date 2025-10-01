#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { CognitoPocStack } from '../lib/cognito-poc-stack';

const app = new App();

new CognitoPocStack(app, 'CognitoPocStack', {
  /* You can pass env here if needed: */
  /* env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION } */
});
