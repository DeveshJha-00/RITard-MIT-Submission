"use client";
import React, { useState, useEffect } from 'react';
import gameData from './data.json';

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
  const [isDarkMode, setIsDarkMode] = useState(false);

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
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedCharacter) setSelectedCharacter(JSON.parse(savedCharacter));
    if (savedAccessories) setPurchasedAccessories(JSON.parse(savedAccessories));
    if (savedPositions) setAccessoryPositions(JSON.parse(savedPositions));
    if (savedPoints) setPoints(parseInt(savedPoints));
    if (savedDarkMode) setIsDarkMode(savedDarkMode === 'true');
  }, []);

  // Toggle dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Save dark mode preference
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('darkMode', (!isDarkMode).toString());
  };

  // Character selection screen
  if (showCharacterSelect) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Choose Your Character</h1>
          <div className="grid grid-cols-2 gap-4">
            {gameData.characters.map((character) => (
              <button
                key={character.id}
                onClick={() => handleCharacterSelect(character)}
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:border-gray-600"
              >
                <img
                  src={character.image}
                  alt={character.name}
                  className="w-32 h-32 mx-auto mb-2"
                />
                <p className="text-center font-medium text-gray-900 dark:text-white">{character.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Welcome screen
  if (showWelcome) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Welcome to Savings Quest!</h1>
          <p className="mb-4 text-gray-700 dark:text-gray-300">Embark on a journey to achieve your financial goals while having fun!</p>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">What should we call you?</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Your name"
            />
          </div>

          <button
            onClick={() => {
              setShowWelcome(false);
              setShowCharacterSelect(true);
            }}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Start Your Quest
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-md mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Savings Quest</h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {isDarkMode ? '🌞' : '🌙'}
          </button>
        </div>

        {renderUserProfile()}

        {/* Room and Character Display */}
        <div 
          className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6 overflow-hidden"
          onDrop={handleAccessoryDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <img
            src="/images/mid.jpg"
            alt="Room"
            className="w-full h-full object-cover"
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

        {/* Store Button */}
        <button
          onClick={() => setShowStore(true)}
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors mb-6"
        >
          Store (Points: {points})
        </button>

        {/* Store Modal */}
        {showStore && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Accessories Store</h2>
                <button
                  onClick={() => setShowStore(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {gameData.accessories.map((accessory) => (
                  <div key={accessory.id} className="border dark:border-gray-700 rounded-lg p-4">
                    <img
                      src={accessory.image}
                      alt={accessory.name}
                      className="w-16 h-16 mx-auto mb-2"
                    />
                    <p className="text-center font-medium">{accessory.name}</p>
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                      {accessory.price} points
                    </p>
                    <button
                      onClick={() => handlePurchaseAccessory(accessory)}
                      disabled={points < accessory.price || purchasedAccessories.includes(accessory.id)}
                      className={`w-full mt-2 py-1 rounded-md ${
                        points < accessory.price || purchasedAccessories.includes(accessory.id)
                          ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white`}
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
          <div className="fixed top-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4 rounded shadow-md max-w-xs animate-bounce">
            <div className="flex">
              <div className="flex-shrink-0">
                🏆
              </div>
              <div className="ml-3">
                <p className="font-bold">{latestAchievement.title}</p>
                <p className="text-sm">{latestAchievement.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Goals List */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Goals</h2>
            <button
              onClick={() => setShowAddGoal(true)}
              className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700 transition-colors"
            >
              + New Goal
            </button>
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">You haven't created any goals yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{goal.icon}</span>
                      <h3 className="font-medium">{goal.name}</h3>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                        Lvl {goal.level}
                      </span>
                      {goal.streaks > 0 && (
                        <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                          🔥 {goal.streaks}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>${goal.currentAmount.toFixed(2)}</span>
                      <span>${goal.targetAmount.toFixed(2)}</span>
                    </div>
                    <div className="bg-gray-200 h-2 rounded-full">
                      <div
                        className={`h-2 rounded-full ${goal.currentAmount >= goal.targetAmount ? 'bg-green-500' : 'bg-indigo-500'}`}
                        style={{ width: `${calculateProgress(goal.currentAmount, goal.targetAmount)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {calculateProgress(goal.currentAmount, goal.targetAmount).toFixed(0)}% complete
                    </span>
                    <button
                      onClick={() => {
                        setSelectedGoalIndex(index);
                        setShowAddSavings(true);
                      }}
                      className="text-indigo-600 text-sm hover:text-indigo-800"
                    >
                      Add Savings
                    </button>
                  </div>

                  {goal.currentAmount >= goal.targetAmount && (
                    <div className="mt-2 bg-green-100 text-green-800 p-2 rounded-md text-sm text-center">
                      🎉 Goal complete! 🎉
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Achievements Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Achievements</h2>
          {achievements.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Complete goals to earn achievements</p>
            </div>
          ) : (
            <div className="space-y-2">
              {achievements.slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="flex items-center p-2 bg-yellow-50 rounded-md">
                  <span className="text-xl mr-2">🏆</span>
                  <div>
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              ))}
              {achievements.length > 3 && (
                <div className="text-center">
                  <button className="text-indigo-600 text-sm">
                    View all {achievements.length} achievements
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Goal Modal */}
        {showAddGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Create New Goal</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Goal Name</label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Vacation, Emergency Fund, etc."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Target Amount ($)</label>
                <input
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
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
                      className={`text-2xl p-2 rounded-md ${newGoal.icon === icon ? 'bg-indigo-100 border-2 border-indigo-500' : 'bg-gray-50'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowAddGoal(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGoal}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Goal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Savings Modal */}
        {showAddSavings && selectedGoalIndex !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">
                Add Savings to {goals[selectedGoalIndex].name}
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Amount ($)</label>
                <input
                  type="number"
                  value={savingsAmount}
                  onChange={(e) => setSavingsAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="100"
                  min="0.01"
                  step="0.01"
                />
              </div>

              {goals[selectedGoalIndex].streaks > 0 && (
                <div className="mb-4 p-3 bg-orange-50 rounded-md">
                  <p className="text-sm">
                    <span className="font-bold">🔥 {goals[selectedGoalIndex].streaks} day streak!</span>
                    {goals[selectedGoalIndex].streaks >= 3 && (
                      <span> You'll get a {goals[selectedGoalIndex].streaks * 5} XP bonus for maintaining your streak!</span>
                    )}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowAddSavings(false);
                    setSelectedGoalIndex(null);
                  }}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSavings}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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