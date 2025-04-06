"use client";
import React, { useState, useEffect } from 'react';
import gameData from './data.json';
import { useTheme } from "next-themes";
import { ThemeToggle } from '@/components/theme-toggle';

const SavingsGame = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: 0,
    icon: '🏦',
    level: 1,
    xp: 0,
    streaks: 0,
    lastContribution: null
  });
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddSavings, setShowAddSavings] = useState(false);
  const [selectedGoalIndex, setSelectedGoalIndex] = useState(null);
  const [savingsAmount, setSavingsAmount] = useState('');
  const [userName, setUserName] = useState('Saver');
  const [userLevel, setUserLevel] = useState(1);
  const [userXp, setUserXp] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const [showAchievement, setShowAchievement] = useState(false);
  const [latestAchievement, setLatestAchievement] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [points, setPoints] = useState(0);
  const [purchasedAccessories, setPurchasedAccessories] = useState([]);
  const [accessoryPositions, setAccessoryPositions] = useState({});
  const [showStore, setShowStore] = useState(false);
  const [draggedAccessory, setDraggedAccessory] = useState(null);
  const { theme } = useTheme();

  // Icons for goals
  const icons = ['🏦', '🏠', '🚗', '✈️', '💻', '🎓', '💍', '👶', '🏝️', '🛍️'];

  // Calculate level based on XP (exponential growth)
  const calculateLevel = (xp) => {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  };

  // Calculate XP needed for next level
  const xpForNextLevel = (level) => {
    return (level * level) * 100;
  };

  // Add new achievement
  const addAchievement = (title, description) => {
    const newAchievement = {
      id: achievements.length + 1,
      title,
      description,
      date: new Date()
    };

    setAchievements([...achievements, newAchievement]);
    setLatestAchievement(newAchievement);
    setShowAchievement(true);

    // Hide the achievement notification after 3 seconds
    setTimeout(() => {
      setShowAchievement(false);
    }, 3000);
  };

  // Check for achievements when goals change
  useEffect(() => {
    if (goals.length === 1) {
      addAchievement('First Goal Created!', 'You set your first savings goal.');
    }
    if (goals.length === 3) {
      addAchievement('Goal Master', 'You are managing multiple goals like a pro!');
    }

    // Check for completed goals
    goals.forEach((goal) => {
      if (goal.currentAmount >= goal.targetAmount && !goal.achieved) {
        addAchievement(`${goal.name} Completed!`, `You reached your goal of saving ${goal.targetAmount}!`);

        // Update the goal with achieved flag
        setGoals(goals.map(g =>
          g.name === goal.name ? { ...g, achieved: true } : g
        ));
      }
    });
  }, [goals]);

  // Handle adding a new goal
  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount) return;

    const goalAmount = parseFloat(newGoal.targetAmount);
    if (isNaN(goalAmount) || goalAmount <= 0) return;

    setGoals([...goals, { ...newGoal, targetAmount: goalAmount }]);
    setNewGoal({
      name: '',
      targetAmount: '',
      currentAmount: 0,
      icon: '🏦',
      level: 1,
      xp: 0,
      streaks: 0,
      lastContribution: null
    });
    setShowAddGoal(false);

    // Add XP for creating a goal
    const addedXp = 50;
    const newXp = userXp + addedXp;
    setUserXp(newXp);
    setUserLevel(calculateLevel(newXp));
  };

  // Handle adding savings to a goal
  const handleAddSavings = () => {
    if (selectedGoalIndex === null) return;

    const amount = parseFloat(savingsAmount);
    if (isNaN(amount) || amount <= 0) return;

    const updatedGoals = [...goals];
    const goal = updatedGoals[selectedGoalIndex];

    // Calculate streak
    const today = new Date().toDateString();
    let streakChange = 0;
    let streakBonus = 0;

    if (goal.lastContribution) {
      const lastDate = new Date(goal.lastContribution);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastDate.toDateString() === yesterday.toDateString()) {
        streakChange = 1;
        streakBonus = goal.streaks * 5; // 5 XP per day of streak
      } else if (lastDate.toDateString() !== today) {
        streakChange = -goal.streaks;
      }
    }

    // Calculate XP and points based on percentage of goal and streak bonus
    const percentOfGoal = amount / goal.targetAmount;
    const baseXp = Math.round(percentOfGoal * 100);
    const goalXp = baseXp + streakBonus;
    
    // Award points based on percentage of goal saved (max 50 points per contribution)
    const pointsEarned = Math.min(Math.round(percentOfGoal * 50), 50);
    setPoints(prevPoints => {
      const newPoints = prevPoints + pointsEarned;
      localStorage.setItem('points', newPoints.toString());
      return newPoints;
    });

    // Update goal
    updatedGoals[selectedGoalIndex] = {
      ...goal,
      currentAmount: goal.currentAmount + amount,
      lastContribution: today,
      streaks: goal.streaks + streakChange,
      xp: goal.xp + goalXp,
      level: calculateLevel(goal.xp + goalXp)
    };

    setGoals(updatedGoals);
    setSavingsAmount('');
    setShowAddSavings(false);

    // Update user XP and level
    const totalAddedXp = baseXp + streakBonus + 10; // Base + streak bonus + 10 for activity
    const newUserXp = userXp + totalAddedXp;
    setUserXp(newUserXp);
    setUserLevel(calculateLevel(newUserXp));

    // Check for streak achievements
    if (updatedGoals[selectedGoalIndex].streaks === 3) {
      addAchievement('Consistency is Key', 'You saved 3 days in a row!');
    } else if (updatedGoals[selectedGoalIndex].streaks === 7) {
      addAchievement('Week Warrior', 'You saved for 7 consecutive days!');
    }
  };

  // Calculate goal progress percentage
  const calculateProgress = (current, target) => {
    const percentage = (current / target) * 100;
    return Math.min(percentage, 100);
  };

  // Render user profile section
  const renderUserProfile = () => (
    <div className="bg-indigo-100 rounded-lg p-4 mb-6 flex items-center">
      <div className="bg-indigo-500 rounded-full h-16 w-16 flex items-center justify-center text-2xl text-white">
        {userName.charAt(0).toUpperCase()}
      </div>
      <div className="ml-4">
        <h3 className="font-bold text-lg">{userName}</h3>
        <div className="flex items-center">
          <span className="mr-2">Level {userLevel}</span>
          <div className="bg-gray-200 h-2 rounded-full w-32">
            <div
              className="bg-indigo-500 h-2 rounded-full"
              style={{ width: `${(userXp / xpForNextLevel(userLevel)) * 100}%` }}
            ></div>
          </div>
          <span className="ml-2 text-xs text-gray-600">
            {userXp}/{xpForNextLevel(userLevel)} XP
          </span>
        </div>
      </div>
    </div>
  );

  // Handle character selection
  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    setShowCharacterSelect(false);
    // Save to localStorage
    localStorage.setItem('selectedCharacter', JSON.stringify(character));
  };

  // Handle accessory purchase
  const handlePurchaseAccessory = (accessory) => {
    if (points >= accessory.price) {
      setPoints(points - accessory.price);
      setPurchasedAccessories([...purchasedAccessories, accessory.id]);
      // Save to localStorage
      localStorage.setItem('purchasedAccessories', JSON.stringify([...purchasedAccessories, accessory.id]));
    }
  };

  // Handle accessory drag
  const handleAccessoryDrag = (e, accessoryId) => {
    setDraggedAccessory(accessoryId);
  };

  const handleAccessoryDrop = (e) => {
    if (draggedAccessory) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setAccessoryPositions({
        ...accessoryPositions,
        [draggedAccessory]: { x, y }
      });
      
      // Save to localStorage
      localStorage.setItem('accessoryPositions', JSON.stringify({
        ...accessoryPositions,
        [draggedAccessory]: { x, y }
      }));
    }
  };

  // Load saved data on component mount
  useEffect(() => {
    const savedCharacter = localStorage.getItem('selectedCharacter');
    const savedAccessories = localStorage.getItem('purchasedAccessories');
    const savedPositions = localStorage.getItem('accessoryPositions');
    const savedPoints = localStorage.getItem('points');
    
    if (savedCharacter) setSelectedCharacter(JSON.parse(savedCharacter));
    if (savedAccessories) setPurchasedAccessories(JSON.parse(savedAccessories));
    if (savedPositions) setAccessoryPositions(JSON.parse(savedPositions));
    if (savedPoints) setPoints(parseInt(savedPoints));
  }, []);

  // Toggle dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Welcome screen & Character selection screen styling updates (making less purple)
  if (showCharacterSelect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-blue-900">
        <div className="max-w-md w-full mx-auto p-8 bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-3 text-white">Choose Your Character</h1>
            <div className="w-16 h-1 bg-blue-400 mx-auto mb-4 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            {gameData.characters.map((character) => (
              <button
                key={character.id}
                onClick={() => handleCharacterSelect(character)}
                className="p-5 border border-white/30 rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 group"
              >
                <div className="bg-white/20 rounded-full p-3 mb-3 mx-auto w-36 h-36 flex items-center justify-center overflow-hidden">
                  <img
                    src={character.image}
                    alt={character.name}
                    className="w-28 h-28 object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <p className="text-center font-medium text-white text-lg">{character.name}</p>
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowCharacterSelect(false)}
            className="w-full bg-white/20 text-white py-2 rounded-lg hover:bg-white/30 transition-colors mt-4 border border-white/30"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // Welcome screen
  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-blue-900">
        <div className="max-w-md w-full mx-auto p-8 bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-3 text-white">Welcome to Savings Quest!</h1>
            <div className="w-16 h-1 bg-blue-400 mx-auto mb-4 rounded-full"></div>
            <p className="text-lg text-blue-100">Embark on a journey to achieve your financial goals while having fun!</p>
          </div>

          <div className="mb-6 bg-white/20 p-6 rounded-lg">
            <label className="block text-sm font-medium mb-2 text-white">What should we call you?</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 border-0 rounded-md bg-white/30 backdrop-blur-sm text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Your name"
            />
          </div>

          <button
            onClick={() => {
              setShowWelcome(false);
              setShowCharacterSelect(true);
            }}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 transition-colors font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 duration-200"
          >
            Start Your Quest
          </button>
          
          <div className="mt-6 text-center">
            <p className="text-blue-200 text-sm">Your journey to financial freedom begins here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <header className="flex justify-between items-center mb-6 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold">Savings Quest</h1>
          <div className="flex items-center gap-4">
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              Points: {points}
            </span>
            <ThemeToggle />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - User profile and character display */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 transition-all hover:shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full h-16 w-16 flex items-center justify-center text-2xl text-white shadow-md">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-lg">{userName}</h3>
                  <div className="flex items-center mt-1">
                    <span className="mr-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full">
                      Level {userLevel}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>XP: {userXp}</span>
                  <span>Next: {xpForNextLevel(userLevel)}</span>
                </div>
                <div className="bg-gray-200 dark:bg-slate-700 h-2 rounded-full">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                    style={{ width: `${(userXp / xpForNextLevel(userLevel)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Room and Character Display */}
            <div 
              className="relative h-64 bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 overflow-hidden"
              onDrop={handleAccessoryDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <img
                src="/images/mid.jpg"
                alt="Room"
                className="w-full h-full object-cover rounded-lg"
                draggable="false"
              />
              {selectedCharacter && (
                <img
                  src={selectedCharacter.image}
                  alt={selectedCharacter.name}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32"
                  draggable="false"
                />
              )}
              {purchasedAccessories.map((accessoryId) => {
                const accessory = gameData.accessories.find(a => a.id === accessoryId);
                const position = accessoryPositions[accessoryId] || { x: 0, y: 0 };
                return (
                  <img
                    key={accessoryId}
                    src={accessory.image}
                    alt={accessory.name}
                    className="absolute w-16 h-16 cursor-move"
                    style={{ left: position.x, top: position.y }}
                    draggable
                    onDragStart={(e) => handleAccessoryDrag(e, accessoryId)}
                  />
                );
              })}
            </div>
            
            <button
              onClick={() => setShowStore(true)}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium py-3 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0 duration-200"
            >
              Visit Store
            </button>
            
            {/* Achievements Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 transition-all hover:shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="mr-2">🏆</span>
                Achievements
              </h2>
              {achievements.length === 0 ? (
                <div className="text-center py-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">Complete goals to earn achievements</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {achievements.slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="flex items-center p-3 bg-amber-50 dark:bg-amber-900/30 rounded-md">
                      <span className="text-xl mr-2">🏆</span>
                      <div>
                        <h4 className="font-medium text-sm">{achievement.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                  {achievements.length > 3 && (
                    <div className="text-center pt-2">
                      <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                        View all {achievements.length} achievements
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right column - Goals and interactions */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <span className="mr-2">🎯</span>
                  Your Goals
                </h2>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm hover:from-blue-600 hover:to-cyan-600 transition-colors shadow-md"
                >
                  + New Goal
                </button>
              </div>

              {goals.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-100 dark:border-slate-600">
                  <div className="text-7xl mb-4">🏦</div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">You haven't created any goals yet.</p>
                  <button
                    onClick={() => setShowAddGoal(true)}
                    className="mt-4 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Start by creating your first goal
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {goals.map((goal, index) => (
                    <div 
                      key={index} 
                      className="border dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-800"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center">
                          <span className="text-3xl mr-3 bg-blue-100 dark:bg-blue-900/40 h-12 w-12 flex items-center justify-center rounded-full">{goal.icon}</span>
                          <h3 className="font-medium text-lg">{goal.name}</h3>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                            Lvl {goal.level}
                          </span>
                          {goal.streaks > 0 && (
                            <span className="ml-2 text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 px-2 py-1 rounded-full">
                              🔥 {goal.streaks}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">${goal.currentAmount.toFixed(2)}</span>
                          <span className="text-gray-500 dark:text-gray-400">${goal.targetAmount.toFixed(2)}</span>
                        </div>
                        <div className="bg-gray-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              goal.currentAmount >= goal.targetAmount 
                                ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                                : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                            }`}
                            style={{ width: `${calculateProgress(goal.currentAmount, goal.targetAmount)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {calculateProgress(goal.currentAmount, goal.targetAmount).toFixed(0)}% complete
                        </span>
                        <button
                          onClick={() => {
                            setSelectedGoalIndex(index);
                            setShowAddSavings(true);
                          }}
                          className="text-blue-600 dark:text-blue-400 font-medium text-sm hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        >
                          Add Savings
                        </button>
                      </div>

                      {goal.currentAmount >= goal.targetAmount && (
                        <div className="mt-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-2 rounded-md text-sm text-center">
                          🎉 Goal complete! 🎉
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Store Modal */}
        {showStore && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">🛍️</span>
                  <h2 className="text-xl font-bold">Accessories Store</h2>
                </div>
                <div className="flex items-center">
                  <span className="mr-4 font-medium text-blue-600 dark:text-blue-400">
                    {points} points available
                  </span>
                  <button
                    onClick={() => setShowStore(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {gameData.accessories.map((accessory) => (
                  <div key={accessory.id} className="border dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-all">
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 mb-3 flex items-center justify-center">
                      <img
                        src={accessory.image}
                        alt={accessory.name}
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <p className="text-center font-medium mb-1">{accessory.name}</p>
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {accessory.price} points
                    </p>
                    <button
                      onClick={() => handlePurchaseAccessory(accessory)}
                      disabled={points < accessory.price || purchasedAccessories.includes(accessory.id)}
                      className={`w-full py-2 rounded-lg ${
                        points < accessory.price || purchasedAccessories.includes(accessory.id)
                          ? 'bg-gray-300 dark:bg-slate-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transform hover:-translate-y-1 hover:shadow-md active:translate-y-0'
                      } text-white transition-all`}
                    >
                      {purchasedAccessories.includes(accessory.id) ? 'Purchased' : 'Buy'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Achievement notification */}
        {showAchievement && latestAchievement && (
          <div className="fixed top-4 right-4 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/70 dark:to-yellow-900/70 border-l-4 border-yellow-500 p-4 rounded-lg shadow-lg max-w-xs animate-bounce">
            <div className="flex">
              <div className="flex-shrink-0">
                🏆
              </div>
              <div className="ml-3">
                <p className="font-bold text-amber-900 dark:text-amber-100">{latestAchievement.title}</p>
                <p className="text-sm text-amber-800 dark:text-amber-200">{latestAchievement.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Add Goal Modal */}
        {showAddGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">✨</span>
                Create New Goal
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Goal Name</label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none placeholder-gray-500 dark:placeholder-gray-300"
                  placeholder="Vacation, Emergency Fund, etc."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Target Amount ($)</label>
                <input
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none placeholder-gray-500 dark:placeholder-gray-300"
                  placeholder="1000"
                  min="1"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Choose an Icon</label>
                <div className="grid grid-cols-5 gap-2">
                  {icons.map((icon, idx) => (
                    <button
                      key={idx}
                      onClick={() => setNewGoal({ ...newGoal, icon })}
                      className={`text-2xl p-2 rounded-lg ${
                        newGoal.icon === icon 
                          ? 'bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-500 dark:border-blue-400' 
                          : 'bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600'
                      } transition-colors`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddGoal(false)}
                  className="px-4 py-2 border dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGoal}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors"
                >
                  Create Goal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Savings Modal */}
        {showAddSavings && selectedGoalIndex !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-slate-700">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{goals[selectedGoalIndex].icon}</span>
                <h2 className="text-xl font-bold">
                  Add to {goals[selectedGoalIndex].name}
                </h2>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Amount ($)</label>
                <input
                  type="number"
                  value={savingsAmount}
                  onChange={(e) => setSavingsAmount(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none placeholder-gray-500 dark:placeholder-gray-300"
                  placeholder="100"
                  min="0.01"
                  step="0.01"
                />
              </div>

              {goals[selectedGoalIndex].streaks > 0 && (
                <div className="mb-4 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <p className="flex items-center gap-2">
                    <span className="text-xl">🔥</span>
                    <span className="font-bold">{goals[selectedGoalIndex].streaks} day streak!</span>
                  </p>
                  {goals[selectedGoalIndex].streaks >= 3 && (
                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                      You'll get a {goals[selectedGoalIndex].streaks * 5} XP bonus for maintaining your streak!
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddSavings(false);
                    setSelectedGoalIndex(null);
                  }}
                  className="px-4 py-2 border dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSavings}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavingsGame;