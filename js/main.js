class Model{
    constructor(){
        this.todos = JSON.parse(localStorage.getItem('todos')) || []
    }
    addTodo(todoText){
        const todo = {
            id: this.todos.length > 0 ? this.todos[this.todos.length-1].id + 1: 1,
            text: todoText,
            complete: false
        }
        this.todos.push(todo)
        this._commit(this.todos)
    }
    editTodo(id,updatedText){
        this.todos = this.todos.map(todo => todo.id === id ? {id: todo.id, text: updatedText, complete: todo.complete} : todo)
        this._commit(this.todos)
    }
    deleteTodo(id){
        this.todos = this.todos.filter(todo => todo.id !== id)
        this._commit(this.todos)
    }
    toggleTodo(id){
        this.todos = this.todos.map(todo => todo.id === id ? {id: todo.id, text: todo.text, complete: !todo.complete} : todo)
        this._commit(this.todos)
    }
    bindTodoListChanged(callback){
        this.onTodoListChanged = callback
    }
    _commit(todos){
        this.onTodoListChanged(todos)
        localStorage.setItem('todos', JSON.stringify(todos))
    }
}

class View{
    constructor(){
        this.app = this.getElement('#root');
        this.title = this.createElement('h1');
        this.title.textContent = 'Список задач';
        //Создаем форму с инпутом и кнопкой сабмит
        this.form = this.createElement('form');

        this.input=this.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = 'Добавьте задачу';
        this.input.name = 'todo';

        this.submitButton = this.createElement('button');
        this.submitButton.textContent = 'Добавить';

        //Визуальное отображение списка задач
        this.todoList = this.createElement('ul','todo-list');

        //Append input and submit
        this.form.append(this.input, this.submitButton);

        //Append title, form and list into app
        this.app.append(this.title, this.form, this.todoList);

        this._temporaryTodoText
        this._initLocalListeners()
    }
    createElement(tag, className){
        const element = document.createElement(tag)
        if (className) element.classList.add(className)
        return element
    }
    getElement(selector){
        const element = document.querySelector(selector)
        return element
    }
    get _todoText(){
        return this.input.value
    }
    _resetInput(){
        this.input.value = ''
    }
    displayTodos(todos){
        while (this.todoList.firstChild){
            this.todoList.removeChild(this.todoList.firstChild)
        } 

        if (todos.length === 0){
            const p = this.createElement('p')
            p.textContent = 'Нечего делать! Добавить задачу?'
            this.todoList.append(p)
        } else{
            todos.forEach(todo => {
                const li = this.createElement('li')
                li.id = todo.id

                const checkbox = this.createElement('input')
                checkbox.type = 'checkbox'
                checkbox.checked = todo.complete

                const span = this.createElement('span', 'editable')
                span.contentEditable = true

                if (todo.complete){
                    const strike = this.createElement('s')
                    strike.textContent = todo.text
                    span.append(strike)
                } else{
                    span.textContent = todo.text
                }

                const deleteButton = this.createElement('button', 'delete')
                deleteButton.textContent = 'Удалить'
                li.append(checkbox, span, deleteButton)

                this.todoList.append(li)
            })
        }
    }
    bindAddTodo(handler){
        this.form.addEventListener('submit', event =>{
            event.preventDefault()
            if (this._todoText){
                handler(this._todoText)
                this._resetInput()
            }
        })
    }

    bindDeleteTodo(handler){
        this.todoList.addEventListener('click', event =>{
            if (event.target.className === 'delete'){
                const id = parseInt(event.target.parentElement.id)

                handler(id)
            }
        })
    }

    bindToggleTodo(handler){
        this.todoList.addEventListener('change', event => {
            if (event.target.type === 'checkbox'){
                const id = parseInt(event.target.parentElement.id)

                handler(id)
            }
        })
    }

    _initLocalListeners(){
        this.todoList.addEventListener('input', event => {
            if (event.target.className === 'editable'){
                this._temporaryTodoText = event.target.innerText
            }
        })
    }

    bindEditTodo(handler){
        this.todoList.addEventListener('focusout', event => {
            if(this._temporaryTodoText){
                const id = parseInt(event.target.parentElement.id)

                handler(id, this._temporaryTodoText)
                this._temporaryTodoText = ''
            }
        })
    }
}

class Controller{
    constructor(model,view){
        this.model = model
        this.view = view

        this.onTodoListChanged(this.model.todos)
        this.view.bindAddTodo(this.handleAddTodo)
        this.view.bindDeleteTodo(this.handleDeleteTodo)
        this.view.bindToggleTodo(this.handleToggleTodo)
        this.view.bindEditTodo(this.handleEditTodo)
        this.model.bindTodoListChanged(this.onTodoListChanged)
    }
    onTodoListChanged = todos => {
        this.view.displayTodos(todos)
    }
    handleAddTodo = todoText =>{
        this.model.addTodo(todoText)
    }
    handleEditTodo = (id, todoText) => {
        this.model.editTodo(id, todoText)
    }
    handleDeleteTodo = id => {
        this.model.deleteTodo(id)
    }
    handleToggleTodo = id => {
        this.model.toggleTodo(id)
    }

    
}
const app = new Controller(new Model(),new View());