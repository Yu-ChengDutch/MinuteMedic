var questions = document.querySelectorAll('.question-card');

questions.forEach(question => {

    const list = question.querySelectorAll('#options');
    const options = question.querySelectorAll('#options li');

    const preShuffledOptions = Array.from(options);

    list.forEach(listItem => {

        // Shuffle the array of list items
        const shuffledOptions = preShuffledOptions.sort(() => Math.random() - 0.5);

        // Clear the current list
        listItem.innerHTML = '';

        // Append the shuffled items back to the list
        shuffledOptions.forEach(item => listItem.appendChild(item));

    })

    

    // Add the on click        
    options.forEach(option => {

        option.addEventListener('click', function() {
            // Disable further clicks
            document.getElementById('options').classList.add('disabled');
    
            // Check all options and color them accordingly
            options.forEach(opt => {
                if (opt.getAttribute('data-answer') === 'correct') {
                    opt.classList.add('correct');
                } else {
                    opt.classList.add('wrong');
                }
            });
        });
    });

});