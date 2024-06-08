let taskList = [];

// Todo: create a function to generate a unique task id
function generateTaskId() {
    // Use crypto to generate a UUID
    return crypto.randomUUID();
}

// Function to get tasks from local storage
function getTasksFromStorage() {
    taskList = JSON.parse(localStorage.getItem("tasks")) || [];
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    // Determine the background color of the card based on the due date
    const getCardBackgroundClass = () => {
        const dueDate = dayjs(task.dueDate);
        const now = dayjs();

        if (dueDate.isBefore(now, "day")) {
            return "bg-danger";
        } else if (dueDate.isSame(now, "day")) {
            return "bg-warning";
        }

        return "bg-light";
    };

    // Determine the due date status text
    const getTaskDueDateStatus = () => {
        const dueDate = dayjs(task.dueDate);
        const now = dayjs();

        if (dueDate.isBefore(now, "day")) {
            return "Past due";
        } else if (dueDate.isSame(now, "day")) {
            return "Due today";
        }

        return "Due in the Future";
    }

    const backgroundClass = getCardBackgroundClass();
    // Get a text class that matches the background for better readability
    const textClass = backgroundClass === 'bg-light' ? 'text-dark' : 'text-light';
    const deleteBtnBorder = backgroundClass === 'bg-danger' && 'border-light';

    // Create the card element
    const card = $("<div>")
        .addClass(`card ${getCardBackgroundClass()} ${textClass} rounded draggable my-3`)
        .attr("data-task-id", task.id)
        .attr("data-status", task.status);

    // Create the card header
    const cardHeader = $("<div>")
        .addClass("card-header")
        .text(task.name);

    // Create the card body
    const cardBody = $("<div>")
        .addClass("card-body");

    // Create the status paragraph
    const cardStatus = $("<p>")
        .text(getTaskDueDateStatus());

    // Create the due date paragraph
    const cardDueDate = $("<p>")
        .text(dayjs(task.dueDate).format("MM/DD/YYYY"));

    // Create the delete button
    const cardDeleteBtn = $("<button>")
        .addClass(`btn btn-danger ${deleteBtnBorder} delete-task`)
        .text("Delete");

    // Append the status, due date, and delete button to the card body
    cardBody.append(cardStatus, cardDueDate, cardDeleteBtn);

    // Add the header and the body to the card, and make it draggable
    card.append(cardHeader, cardBody)
        .draggable({
            opacity: 0.7,
            zIndex: 100,
            helper: function (e) {
                const original = $(e.target).hasClass('ui-draggable')
                    ? $(e.target)
                    : $(e.target).closest('.ui-draggable');

                return original.clone().css({
                    width: original.outerWidth(),
                });
            },
        });

    return card;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    getTasksFromStorage();

    // Get the task list elements
    const todoListEl = $("#todo-cards");
    const inProgressListEl = $("#in-progress-cards");
    const doneListEl = $("#done-cards");

    // Clear the task lists to avoid duplicate rendering
    todoListEl.empty();
    inProgressListEl.empty();
    doneListEl.empty();

    for (const task of taskList) {
        // Create a card for each task
        const card = createTaskCard(task);

        // Append the card to the appropriate list based on the task status
        if (task.status === "to-do") {
            todoListEl.append(card);
        } else if (task.status === "in-progress") {
            inProgressListEl.append(card);
        } else {
            doneListEl.append(card);
        }
    }
}

// Todo: create a function to handle adding a new task
function handleAddTask(e) {
    // Prevent the page from reloading
    e.preventDefault();

    // Get the form element
    const taskFormEl = $('#add-task-form');

    // Get the form input elements
    const taskNameEl = taskFormEl.find('input[name="task-name"]');
    const taskDueDateEl = taskFormEl.find('input[name="task-due-date"]');
    const taskDescriptionEl = taskFormEl.find('textarea[name="task-description"]');

    // Get the values from the input elements
    const [name, dueDate, description] = [
        taskNameEl.val(),
        taskDueDateEl.val(),
        taskDescriptionEl.val()
    ];

    // Validate the form values
    if (!name || !dueDate || !description) { return; }

    // Create a new task object
    const task = {
        id: generateTaskId(),
        name,
        dueDate,
        description,
        status: 'to-do'
    };

    // Add the new task to the task list
    taskList.push(task);

    // Save the task list to local storage and re-render the task list
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// Todo: create a function to handle deleting a task
function handleDeleteTask() {
    // Get the task ID from the card element
    let taskId = $(this).closest(".card").attr("data-task-id");
    // Filter out the task with the matching ID
    taskList = taskList.filter(task => task.id !== taskId);

    // Save the updated task list to local storage and re-render the task list
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    // Get the task ID from the draggable element
    let taskId = ui.draggable.attr("data-task-id");
    // Get the new status from the drop target's ID
    const newStatus = event.target.id;

    // Find the task in the task list and update its status
    let task = taskList.find(task => task.id === taskId);
    task.status = newStatus;

    console.log({ task, taskList });

    // Save the updated task list to local storage and re-render the task list
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(() => {
    // Render the task list on page load
    renderTaskList();

    // Initialize the date picker for the due date field
    $('#date-picker').datepicker({
        changeMonth: true,
        changeYear: true,
    });

    // Add event listener for the add task form submission
    $("#add-task-form").on("submit", handleAddTask);
    // Add event listener for delete task buttons
    $(document).on("click", ".delete-task", handleDeleteTask);

    // Make the lanes droppable and handle the drop event
    $(".lane").droppable({
        accept: '.draggable',
        drop: handleDrop,
    });
});