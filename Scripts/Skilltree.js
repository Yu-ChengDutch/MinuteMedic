// script.js

// Keep track of which skills are unlocked
let unlockedSkills = [1]; // Skill 1 is unlocked by default

function unlockSkill(skillId) {
    // Ensure the skill can be unlocked based on parent skills
    if (canUnlockSkill(skillId)) {
        document.getElementById(`skill-${skillId}`).classList.add('unlocked');
        unlockedSkills.push(skillId);
    } else {
        alert('You need to unlock previous skills first!');
    }
}

function canUnlockSkill(skillId) {
    // Simple logic: Skill 2 and 3 depend on Skill 1, Skill 4 and 5 depend on Skill 2 or Skill 3
    if (skillId === 2 || skillId === 3) {
        return unlockedSkills.includes(1);
    } else if (skillId === 4 || skillId === 5) {
        return unlockedSkills.includes(2) || unlockedSkills.includes(3);
    }
    return true;
}