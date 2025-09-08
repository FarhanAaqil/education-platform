    const body = document.querySelector("body")
    const sidebar = body.querySelector(".sidebar")
    const toggle = body.querySelector(".toggle")
    const modeSwitch = body.querySelector(".toggle-switch")
    const modeText = body.querySelector(".mode-text")

    toggle.addEventListener("click", () => sidebar.classList.toggle("close"))
    modeSwitch.addEventListener("click", () => {
      body.classList.toggle("dark")
      modeText.innerText = body.classList.contains("dark") ? "Light Mode" : "Dark Mode"
    })

    const navButtons = document.querySelectorAll(".nav-btn")
    const sections = document.querySelectorAll(".content > div")
    navButtons.forEach(button => {
      button.addEventListener("click", (e) => {
        e.preventDefault()
        const targetId = button.getAttribute("data-target")
        sections.forEach(section => section.classList.add("hidden"))
        const el = document.getElementById(targetId)
        if (el) el.classList.remove("hidden")
      })
    })

    let currentDate = new Date()
    const currentMonthElement = document.getElementById("current-month")
    const calendarElement = document.getElementById("calendar")
    const prevMonthButton = document.getElementById("prev-month")
    const nextMonthButton = document.getElementById("next-month")
    const todayButton = document.getElementById("today-btn")
    const daysOfWeek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

    function renderCalendar(){
      calendarElement.innerHTML = ''
      for (let i=0;i<7;i++){
        const dayHeader = document.createElement('div')
        dayHeader.className = 'day-header'
        dayHeader.textContent = daysOfWeek[i]
        calendarElement.appendChild(dayHeader)
      }
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      currentMonthElement.textContent = new Date(year,month,1).toLocaleDateString('en-US',{month:'long',year:'numeric'})
      const firstDay = new Date(year,month,1).getDay()
      const daysInMonth = new Date(year,month+1,0).getDate()
      for (let i=0;i<firstDay;i++){
        const emptyDay = document.createElement('div')
        emptyDay.className = 'calendar-day empty'
        calendarElement.appendChild(emptyDay)
      }
      const today = new Date()
      for (let day=1;day<=daysInMonth;day++){
        const dayElement = document.createElement('div')
        dayElement.className = 'calendar-day'
        const dayNumber = document.createElement('div')
        dayNumber.className = 'day-number'
        dayNumber.textContent = day
        dayElement.appendChild(dayNumber)
        if (year===today.getFullYear() && month===today.getMonth() && day===today.getDate()){
          dayElement.classList.add('today')
        }
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
        const events = getEventsForDate(dateStr)
        events.forEach(ev => {
          const eventElement = document.createElement('span')
          eventElement.className = 'event-indicator'
          eventElement.textContent = ev.title
          dayElement.appendChild(eventElement)
        })
        calendarElement.appendChild(dayElement)
      }
    }

    prevMonthButton.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth()-1); renderCalendar() })
    nextMonthButton.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth()+1); renderCalendar() })
    todayButton.addEventListener('click', () => { currentDate = new Date(); renderCalendar() })

    const addEventBtn = document.getElementById("add-event")
    const eventTitle = document.getElementById("event-title")
    const eventDate = document.getElementById("event-date")
    const eventItems = document.getElementById("event-items")
    function getEvents(){ return JSON.parse(localStorage.getItem('calendarEvents')) || [] }
    function saveEvents(events){ localStorage.setItem('calendarEvents', JSON.stringify(events)) }
    function getEventsForDate(dateStr){ const events = getEvents(); return events.filter(event => event.date === dateStr) }

    function renderEvents(){
      const events = getEvents()
      eventItems.innerHTML = ''
      const selections = getReminderSelections()
      events.forEach((event,index) => {
        const li = document.createElement('li')
        const left = document.createElement('div'); left.className = 'left'
        const meta = document.createElement('span'); meta.className = 'meta'; meta.textContent = `${event.title} - ${new Date(event.date).toLocaleDateString()}`
        const remindLabel = document.createElement('label'); remindLabel.style.marginLeft = '10px'; remindLabel.style.fontSize = '.85rem'
        const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.className = 'event-reminder'; checkbox.dataset.id = event.id
        if (selections.events.includes(event.id)) checkbox.checked = true
        remindLabel.appendChild(checkbox)
        remindLabel.appendChild(document.createTextNode(' Remind me'))
        left.appendChild(meta)
        left.appendChild(remindLabel)
        const right = document.createElement('div')
        const del = document.createElement('button'); del.className = 'delete-event'; del.dataset.id = event.id; del.textContent = 'Delete'
        right.appendChild(del)
        li.appendChild(left)
        li.appendChild(right)
        eventItems.appendChild(li)
      })
      document.querySelectorAll('.event-reminder').forEach(cb => {
  cb.addEventListener('change', (e) => {
    const id = e.target.dataset.id
    const selections = getReminderSelections()
    if (e.target.checked) {
      if (!selections.events.includes(id)) selections.events.push(id)
    } else {
      selections.events = selections.events.filter(x => x !== id)
    }
    saveReminderSelections(selections)
    renderReminders()
  })
})
      document.querySelectorAll('.delete-event').forEach(button=>{
        button.addEventListener('click',(e)=>{
          const id = e.target.dataset.id
          deleteEvent(id)
        })
      })
    }

    function addEvent(){
      if (!eventTitle.value || !eventDate.value) { alert("Please enter both title and date"); return }
      const events = getEvents()
      events.push({ id: String(Date.now()), title: eventTitle.value, date: eventDate.value })
      saveEvents(events)
      eventTitle.value = ''
      eventDate.value = ''
      renderEvents()
      renderCalendar()
      renderReminders()
    }

    function deleteEvent(id){
      let events = getEvents()
      events = events.filter(e => e.id !== id)
      saveEvents(events)
      removeReminderSelectionId(id,'events')
      renderEvents()
      renderCalendar()
      renderReminders()
    }

    addEventBtn.addEventListener("click", addEvent)

    const todoInput = document.getElementById("todo-input")
    const addTodoBtn = document.getElementById("add-todo")
    const todoItems = document.getElementById("todo-items")
    function getTodos(){ return JSON.parse(localStorage.getItem('todos')) || [] }
    function saveTodos(todos){ localStorage.setItem('todos', JSON.stringify(todos)) }

    function renderTodos(){
      const todos = getTodos()
      todoItems.innerHTML = ''
      const selections = getReminderSelections()
      todos.forEach((todo,index)=>{
        const li = document.createElement('li')
        if (todo.completed) li.classList.add('completed')
        const left = document.createElement('div'); left.className = 'left'
        const span = document.createElement('span'); span.textContent = todo.text
        const remindLabel = document.createElement('label'); remindLabel.style.marginLeft='10px'; remindLabel.style.fontSize='.85rem'
        const checkbox = document.createElement('input'); checkbox.type='checkbox'; checkbox.className='todo-reminder'; checkbox.dataset.id = todo.id
        if (selections.todos.includes(todo.id)) checkbox.checked = true
        remindLabel.appendChild(checkbox)
        remindLabel.appendChild(document.createTextNode(' Remind me'))
        left.appendChild(span)
        left.appendChild(remindLabel)
        const controls = document.createElement('div'); controls.className = 'controls'
        const doneBtn = document.createElement('button'); doneBtn.className = 'done-todo'; doneBtn.dataset.id = todo.id; doneBtn.textContent = todo.completed ? 'Undo' : 'Done'
        const delBtn = document.createElement('button'); delBtn.className='delete-todo'; delBtn.dataset.id=todo.id; delBtn.textContent='Delete'
        controls.appendChild(doneBtn)
        controls.appendChild(delBtn)
        li.appendChild(left)
        li.appendChild(controls)
        todoItems.appendChild(li)
      })
      document.querySelectorAll('.todo-reminder').forEach(cb => {
  cb.addEventListener('change', (e) => {
    const id = e.target.dataset.id
    const selections = getReminderSelections()
    if (e.target.checked) {
      if (!selections.todos.includes(id)) selections.todos.push(id)
    } else {
      selections.todos = selections.todos.filter(x => x !== id)
    }
    saveReminderSelections(selections)
    renderReminders()
  })
})

      document.querySelectorAll('.done-todo').forEach(button=>{
        button.addEventListener('click', (e)=>{
          toggleTodoComplete(e.target.dataset.id)
        })
      })
      document.querySelectorAll('.delete-todo').forEach(button=>{
        button.addEventListener('click', (e)=>{
          deleteTodo(e.target.dataset.id)
        })
      })
    }

    function addTodo(){
      if (!todoInput.value) return
      const todos = getTodos()
      todos.push({ id: String(Date.now()), text: todoInput.value, completed: false })
      saveTodos(todos)
      todoInput.value = ''
      renderTodos()
      renderReminders()
    }

    function toggleTodoComplete(id){
      const todos = getTodos()
      const idx = todos.findIndex(t=>t.id===id)
      if (idx>-1){
        todos[idx].completed = !todos[idx].completed
        saveTodos(todos)
        renderTodos()
        renderReminders()
      }
    }

    function deleteTodo(id){
      let todos = getTodos()
      todos = todos.filter(t=>t.id!==id)
      saveTodos(todos)
      removeReminderSelectionId(id,'todos')
      renderTodos()
      renderReminders()
    }

    addTodoBtn.addEventListener("click", addTodo)
    todoInput.addEventListener("keypress", (e)=>{ if (e.key==='Enter') addTodo() })

    function getReminderSelections(){
      return JSON.parse(localStorage.getItem('reminderSelections')) || { events: [], todos: [] }
    }
    function saveReminderSelections(s){ localStorage.setItem('reminderSelections', JSON.stringify(s)) }
    function removeReminderSelectionId(id,type){
      const s = getReminderSelections()
      s[type] = s[type].filter(x=>x!==id)
      saveReminderSelections(s)
    }

    const remindEventsCheckbox = document.getElementById("remind-events")
    const remindTodosCheckbox = document.getElementById("remind-todos")
    const reminderList = document.getElementById("reminder-list")

    function renderReminders(){
      reminderList.innerHTML = ''
      const today = new Date().toISOString().split('T')[0]
      const selections = getReminderSelections()
      if (remindEventsCheckbox.checked){
        const events = getEvents()
        selections.events.forEach(id=>{
          const e = events.find(ev=>ev.id===id)
          if (e && e.date >= today){
            const li = document.createElement('li')
            const left = document.createElement('div'); left.className='reminder-left'
            left.innerHTML = `<span class="small-badge">📅</span><div><strong>${e.title}</strong><div style="font-size:.85rem;margin-top:2px">${new Date(e.date).toLocaleDateString()}</div></div>`
            const clearBtn = document.createElement('button'); clearBtn.className='delete-event'; clearBtn.dataset.id = e.id; clearBtn.textContent='Dismiss'
            li.appendChild(left)
            li.appendChild(clearBtn)
            reminderList.appendChild(li)
            clearBtn.addEventListener('click', ()=>{ removeReminderSelectionId(e.id,'events'); renderReminders(); renderEvents() })
          }
        })
      }
      if (remindTodosCheckbox.checked){
        const todos = getTodos()
        selections.todos.forEach(id=>{
          const t = todos.find(td=>td.id===id)
          if (t && !t.completed){
            const li = document.createElement('li')
            const left = document.createElement('div'); left.className='reminder-left'
            left.innerHTML = `<span class="small-badge">📝</span><div><strong>${t.text}</strong></div>`
            const clearBtn = document.createElement('button'); clearBtn.className='delete-todo'; clearBtn.dataset.id = t.id; clearBtn.textContent='Dismiss'
            li.appendChild(left)
            li.appendChild(clearBtn)
            reminderList.appendChild(li)
            clearBtn.addEventListener('click', ()=>{ removeReminderSelectionId(t.id,'todos'); renderReminders(); renderTodos() })
          }
        })
      }
      if (!reminderList.hasChildNodes()){
        const li = document.createElement('li'); li.textContent = 'No reminders selected or available.'; reminderList.appendChild(li)
      }
    }

    document.addEventListener('change', (e)=>{
      const selections = getReminderSelections()
      if (e.target && e.target.classList.contains('event-reminder')){
        const id = e.target.dataset.id
        if (e.target.checked){
          if (!selections.events.includes(id)) selections.events.push(id)
        } else {
          selections.events = selections.events.filter(x=>x!==id)
        }
        saveReminderSelections(selections)
        renderReminders()
      }
      if (e.target && e.target.classList.contains('todo-reminder')){
        const id = e.target.dataset.id
        if (e.target.checked){
          if (!selections.todos.includes(id)) selections.todos.push(id)
        } else {
          selections.todos = selections.todos.filter(x=>x!==id)
        }
        saveReminderSelections(selections)
        renderReminders()
      }
      if (e.target === remindEventsCheckbox || e.target === remindTodosCheckbox){
        renderReminders()
      }
    })

    function refreshAll(){
      renderCalendar()
      renderEvents()
      renderTodos()
      renderReminders()
    }

    refreshAll()
