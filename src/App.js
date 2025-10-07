import React, { useState } from 'react';
import { Heart, Activity, Apple, AlertTriangle, CheckCircle, User, Calendar, Dumbbell, Clock, Shield } from 'lucide-react';

const ElderHealthSystem = () => {
  const [currentStep, setCurrentStep] = useState('profile');
  const [userProfile, setUserProfile] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    medicalConditions: [],
    dietaryRestrictions: [],
    mobilityLevel: '',
    goals: []
  });
  const [recommendations, setRecommendations] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const medicalConditions = [
    'Diabetes', 'Hypertension', 'Heart Disease', 'Arthritis', 'Osteoporosis',
    'COPD', 'Kidney Disease', 'Liver Disease', 'Depression', 'Anxiety',
    'Stroke History', 'Cancer History', 'Thyroid Issues', 'Sleep Apnea'
  ];

  const dietaryRestrictions = [
    'Low Sodium', 'Low Sugar', 'Low Fat', 'High Fiber', 'Diabetic',
    'Heart Healthy', 'Kidney Friendly', 'Vegetarian', 'Vegan',
    'Gluten Free', 'Dairy Free', 'Soft Foods', 'Pureed Foods'
  ];

  const mobilityLevels = [
    'Fully Mobile', 'Uses Walking Aid', 'Wheelchair User', 'Limited Mobility', 'Bedridden'
  ];

  const fitnessGoals = [
    'Maintain Independence', 'Improve Balance', 'Increase Strength',
    'Manage Pain', 'Improve Heart Health', 'Better Sleep', 'Social Activity'
  ];

  // Generate recommendations using backend API
  const generateRecommendations = async () => {
    setIsGenerating(true);
    
    try {
      // Call your backend API
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userProfile })
      });

      const data = await response.json();

      if (data.success) {
        setRecommendations(data.recommendations);
        setCurrentStep('recommendations');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('⚠️ Unable to generate recommendations. Please try again in a moment.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPlan = () => {
    const planContent = generatePlanText();
    const blob = new Blob([planContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${userProfile.name.replace(/\s+/g, '_')}_Health_Plan.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    alert('✅ Health plan downloaded successfully!');
  };

  const downloadPlanAsPDF = () => {
    const printWindow = window.open('', '_blank');
    const planHTML = generatePlanHTML();
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Health Plan - ${userProfile.name}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; background: linear-gradient(135deg, #2563EB, #059669); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
            .section { margin-bottom: 30px; }
            .exercise, .meal { background: #F9FAFB; padding: 15px; margin: 15px 0; border-left: 5px solid #059669; border-radius: 8px; }
            h2 { color: #2563EB; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; }
            @media print { body { font-size: 12pt; } }
          </style>
        </head>
        <body>${planHTML}</body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const generatePlanText = () => {
    if (!recommendations) return '';
    
    let content = `
=================================================
    PERSONALIZED HEALTH & WELLNESS PLAN
=================================================

Patient: ${userProfile.name}
Age: ${userProfile.age}
Generated: ${new Date().toLocaleDateString()}

=================================================
    FITNESS PROGRAM
=================================================

`;

    recommendations.fitness.forEach((exercise, index) => {
      content += `
${index + 1}. ${exercise.name}
   Duration: ${exercise.duration}
   Frequency: ${exercise.frequency}
   Description: ${exercise.description}
   Safety: ${exercise.safety}
   ${exercise.modifications ? `Modifications: ${exercise.modifications}` : ''}

`;
    });

    content += `
=================================================
    NUTRITION PLAN
=================================================

`;

    recommendations.diet.forEach((meal, index) => {
      content += `
${index + 1}. ${meal.meal}: ${meal.option}
   Portions: ${meal.portions}
   Benefits: ${meal.benefits}
   Preparation: ${meal.preparation}
   ${meal.modifications ? `Modifications: ${meal.modifications}` : ''}

`;
    });

    return content;
  };

  const generatePlanHTML = () => {
    if (!recommendations) return '';
    
    return `
      <div class="header">
        <h1>AI-Generated Health Plan</h1>
        <h3>For ${userProfile.name}</h3>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
      </div>

      <div class="section">
        <h2>🏃 Fitness Program</h2>
        ${recommendations.fitness.map((exercise, index) => `
          <div class="exercise">
            <h4>${index + 1}. ${exercise.name}</h4>
            <p><strong>Duration:</strong> ${exercise.duration} | <strong>Frequency:</strong> ${exercise.frequency}</p>
            <p>${exercise.description}</p>
            <p><strong>Safety:</strong> ${exercise.safety}</p>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h2>🍎 Nutrition Plan</h2>
        ${recommendations.diet.map((meal, index) => `
          <div class="meal">
            <h4>${index + 1}. ${meal.meal}: ${meal.option}</h4>
            <p><strong>Portions:</strong> ${meal.portions}</p>
            <p><strong>Benefits:</strong> ${meal.benefits}</p>
            <p><strong>Preparation:</strong> ${meal.preparation}</p>
          </div>
        `).join('')}
      </div>
    `;
  };

  const sharePlan = () => {
    const planText = generatePlanText();
    navigator.clipboard.writeText(planText).then(() => {
      alert('✅ Health plan copied to clipboard!');
    });
  };

  const handleProfileUpdate = (field, value) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayUpdate = (field, item) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: prev[field].includes(item) 
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  // PROFILE FORM
  if (currentStep === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-green-100 p-6">
        <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <Heart className="text-white" size={40} />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-wide">Elder Health & Wellness AI</h1>
                <p className="text-blue-100 text-xl mt-2">Your Personalized Health Companion</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="text-center mb-8">
              <p className="text-gray-700 text-lg leading-relaxed">
                Welcome! Let's create a personalized health plan just for you. Simply fill in your information below.
              </p>
            </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* PERSONAL INFO */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center mb-6 border-b border-blue-300 pb-3">
                <div className="bg-blue-600 p-2 rounded-lg mr-3">
                  <User className="text-white" size={24} />
                </div>
                Your Information
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">Your Name</label>
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => handleProfileUpdate('name', e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-3">Age</label>
                    <input
                      type="number"
                      value={userProfile.age}
                      onChange={(e) => handleProfileUpdate('age', e.target.value)}
                      className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      min="60"
                      max="100"
                      placeholder="65"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-3">Gender</label>
                    <select
                      value={userProfile.gender}
                      onChange={(e) => handleProfileUpdate('gender', e.target.value)}
                      className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-3">Height (cm)</label>
                    <input
                      type="number"
                      value={userProfile.height}
                      onChange={(e) => handleProfileUpdate('height', e.target.value)}
                      className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="165"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-3">Weight (kg)</label>
                    <input
                      type="number"
                      value={userProfile.weight}
                      onChange={(e) => handleProfileUpdate('weight', e.target.value)}
                      className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="70"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">How well can you move?</label>
                  <select
                    value={userProfile.mobilityLevel}
                    onChange={(e) => handleProfileUpdate('mobilityLevel', e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Select your mobility</option>
                    {mobilityLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* HEALTH PROFILE */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center mb-6 border-b border-green-300 pb-3">
                <div className="bg-green-600 p-2 rounded-lg mr-3">
                  <Activity className="text-white" size={24} />
                </div>
                Your Health
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">Do you have any of these conditions?</label>
                  <div className="bg-white rounded-lg border-2 border-gray-200 p-4 max-h-56 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-3">
                      {medicalConditions.map(condition => (
                        <label key={condition} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                          <input
                            type="checkbox"
                            checked={userProfile.medicalConditions.includes(condition)}
                            onChange={() => handleArrayUpdate('medicalConditions', condition)}
                            className="w-5 h-5 text-green-600 rounded"
                          />
                          <span className="text-base text-gray-700">{condition}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">Any dietary needs?</label>
                  <div className="bg-white rounded-lg border-2 border-gray-200 p-4 max-h-56 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-3">
                      {dietaryRestrictions.map(restriction => (
                        <label key={restriction} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                          <input
                            type="checkbox"
                            checked={userProfile.dietaryRestrictions.includes(restriction)}
                            onChange={() => handleArrayUpdate('dietaryRestrictions', restriction)}
                            className="w-5 h-5 text-green-600 rounded"
                          />
                          <span className="text-base text-gray-700">{restriction}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">What are your health goals?</label>
                  <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
                    <div className="grid grid-cols-1 gap-3">
                      {fitnessGoals.map(goal => (
                        <label key={goal} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                          <input
                            type="checkbox"
                            checked={userProfile.goals.includes(goal)}
                            onChange={() => handleArrayUpdate('goals', goal)}
                            className="w-5 h-5 text-green-600 rounded"
                          />
                          <span className="text-base text-gray-700">{goal}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center bg-gradient-to-r from-blue-50 to-green-50 p-8 rounded-xl">
            <button
              onClick={generateRecommendations}
              disabled={!userProfile.name || !userProfile.age || !userProfile.mobilityLevel || isGenerating}
              className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-12 py-6 rounded-2xl text-2xl font-bold hover:from-blue-700 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center mx-auto shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Heart className="mr-3" size={32} />
              Get My Personalized Health Plan
            </button>
            <p className="text-gray-600 mt-4 text-lg">
              {!userProfile.name || !userProfile.age || !userProfile.mobilityLevel 
                ? 'Please fill in your name, age, and mobility level to continue' 
                : 'Click the button above to get your personalized plan!'}
            </p>
          </div>
        </div>
        </div>
      </div>
    );
  }

  // LOADING
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-green-100 flex items-center justify-center p-6">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20 max-w-lg">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-24 w-24 border-8 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart className="text-blue-600 animate-pulse" size={32} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Creating Your Health Plan</h2>
          <p className="text-gray-600 text-xl leading-relaxed mb-6">
            Our AI is analyzing your information and creating personalized recommendations just for you...
          </p>
          <div className="bg-blue-50 rounded-lg p-6 text-left">
            <p className="text-blue-700 mb-2">✨ Analyzing your health profile</p>
            <p className="text-blue-700 mb-2">💪 Creating custom exercises</p>
            <p className="text-blue-700 mb-2">🍎 Designing meal plans</p>
            <p className="text-blue-700">🛡️ Adding safety guidelines</p>
          </div>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  // RESULTS - (Continue with same results page from previous code...)
  // I'll provide the rest if needed

  return null;
};

export default ElderHealthSystem;