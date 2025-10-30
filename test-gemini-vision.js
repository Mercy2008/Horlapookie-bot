import { GoogleGenerativeAI } from '@google/generative-ai';
import settings from './settings.js';
import fs from 'fs';

async function testGeminiVision() {
  console.log('🔍 Testing Gemini Vision API...\n');
  
  const apiKey = settings.geminiApiKey;
  if (!apiKey) {
    console.error('❌ No API key found in settings.js');
    return;
  }

  console.log('✅ API Key found');
  console.log('📝 Testing with model: gemini-1.5-flash\n');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // List available models
    console.log('📋 Listing available models for your API key...\n');
    const models = await genAI.listModels();
    console.log('Available models:');
    models.forEach(model => {
      if (model.supportedGenerationMethods.includes('generateContent')) {
        console.log(`  - ${model.name} (supports: ${model.supportedGenerationMethods.join(', ')})`);
      }
    });
    console.log('\n');

    // Test with gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Create a simple test image (1x1 red pixel PNG)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
    
    console.log('🖼️  Testing image analysis...');
    const result = await model.generateContent([
      'Describe this image briefly.',
      {
        inlineData: {
          data: testImageBase64,
          mimeType: 'image/png'
        }
      }
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Success! API is working correctly.\n');
    console.log('📄 Response from Gemini:');
    console.log(text);
    console.log('\n✨ Your vision command should now work correctly!');
    
  } catch (error) {
    console.error('\n❌ Error testing Gemini API:');
    console.error(`   ${error.message}`);
    
    if (error.message.includes('API key')) {
      console.error('\n💡 Tip: Check if your API key is valid and has the correct permissions.');
    } else if (error.message.includes('not found')) {
      console.error('\n💡 Tip: The model might not be available. Check the list of available models above.');
    }
  }
}

testGeminiVision();
