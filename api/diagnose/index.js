const { OpenAIClient, AzureKeyCredential } = require(\"@azure/openai\");
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

module.exports = async function (context, req) {
  const userSymptom = req.body?.symptom || \"\";

  const client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
  const response = await client.getChatCompletions(deployment, [
    { role: \"system\", content: \"You are a helpful e-bike repair assistant.\" },
    { role: \"user\", content: userSymptom }
  ]);

  const message = response.choices?.[0]?.message?.content || \"I'm not sure how to help with that yet.\";

  context.res = {
    body: {
      diagnosis: message
    }
  };
};
