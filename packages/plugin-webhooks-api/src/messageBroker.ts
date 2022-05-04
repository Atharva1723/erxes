import { generateModels } from './connectionResolver';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { sendToWebhook } from './utils';
import { serviceDiscovery } from './configs';

let client;

export const initBroker = async (cl) => {
  client = cl;

  const { consumeQueue } = client;
  
  consumeQueue('webhooks:sendToWebhook', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    
    return {
      status: 'success',
      data: await sendToWebhook(models, subdomain, data)
    };
  }); 
};

export const sendCommonMessage = async (args: ISendMessageArgs & { serviceName: string } ) => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  })
};

export default function() {
  return client;
}
