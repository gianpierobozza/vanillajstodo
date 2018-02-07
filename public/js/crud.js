var xhr = new XMLHttpRequest();
var DONE = 4;
var OK = 200;
var NO_CONTENT = 204;

document.onreadystatechange = function () {
  // as close as possible to a document ready state
  if (document.readyState == "interactive")
    getList();
};

// GET the initial list of tasks
function getList() {
  xhr.open('GET', 'api/tasks');
  xhr.send(null);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === DONE) {
      if (xhr.status === OK) {
        var tbody = document.getElementById('tbody');
        var jsonResponse = JSON.parse(xhr.responseText);
        var length = 0;
        for(var k in jsonResponse)
          if(jsonResponse.hasOwnProperty(k))
            length++;
        if (length > 0) {
          // remove all, faster than .innerHTML = '';
          while (tbody.firstChild)
            tbody.removeChild(tbody.firstChild);
          // add the results
          for(var k in jsonResponse)
            tbody.append(createRow(jsonResponse[k].id, jsonResponse[k].text));  
        }
      } else {
        alert('Error GET: ' + xhr.status);
      }
    }
  }
}

// CREATE a task
function addTask() {
  var text = document.getElementById('newTask').value;
  if (text !== '') {
    document.getElementById('newTaskButton').setAttribute('disabled', 'disabled');
    var newId = + new Date();
    xhr.open('POST', '/api/tasks/');
    xhr.setRequestHeader("Content-type", "application/json");
    var body = {
      'id': newId,
      'text': text
    }
    xhr.send(JSON.stringify(body));
    xhr.onreadystatechange = function () {
      if (xhr.readyState === DONE) {
        if (xhr.status === NO_CONTENT) {
          document.getElementById('tbody').append(createRow(newId, text));
          document.getElementById('newTaskButton').removeAttribute('disabled');
          document.getElementById('newTask').value = '';
        } else {
          alert('Error PUT: ' + xhr.status);
        }
      }
    }
  } else {
    return false;
  }
}

// UPDATE a task text
function updateTask(id, text) {
  xhr.open('PUT', '/api/tasks/'+id);
  xhr.setRequestHeader("Content-type", "application/json");
  var body = {
    'id': id,
    'text': text
  }
  xhr.send(JSON.stringify(body));
  xhr.onreadystatechange = function () {
    if (xhr.readyState === DONE) {
      if (xhr.status === NO_CONTENT) {
        document.getElementById('input-'+id).classList.add('d-none');
        var span = document.getElementById('span-'+id);
        span.innerHTML = text;
        span.classList.remove('d-none');
        // remove the disabled attribute and make the Edit button usable again
        document.getElementById('editButton-'+id).removeAttribute('disabled');
      } else {
        alert('Error PUT: ' + xhr.status);
      }
    }
  }
}

// DELETE a task text
function deleteTask(id) {
  xhr.open('DELETE', '/api/tasks/'+id);
  xhr.send(null);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === DONE) {
      if (xhr.status === NO_CONTENT) {
        var task = document.getElementById(id);
        // remove all, faster than .innerHTML = '';
        while (task.firstChild)
          task.removeChild(task.firstChild);
      } else {
        alert('Error PUT: ' + xhr.status);
      }
    }
  }
}

// Utility method, create a new row
function createRow(id, text) {
  var tr = document.createElement('tr');
  tr.setAttribute('id', id);

  var th = document.createElement('th');
  th.setAttribute('scope', 'row');
  th.innerHTML = id;
  tr.append(th);

  var td = document.createElement('td');
  var span = document.createElement('span');
  span.innerHTML = text;
  span.setAttribute('id', 'span-'+id);

  var input = document.createElement('input');
  input.classList.add('d-none', 'inline-input');
  input.setAttribute('type', 'text');
  input.setAttribute('value', text);
  input.setAttribute('id', 'input-'+id);
  input.onkeydown = function(evt) {
    evt = evt || window.event;
    // Enter is pressed, save new text
    if ("key" in evt && (evt.key == "Enter" || evt.keyCode == 13)) {
      updateTask(this.getAttribute('id').replace('input-',''), this.value);
    }
    // Escape is pressed, cancel
    if ("key" in evt && (evt.key == "Escape" || evt.keyCode == 27)) {
      this.classList.add('d-none');
      var span = document.getElementById(this.getAttribute('id').replace('input-','span-'));
      span.classList.remove('d-none');
      // reset the input field with the original value
      document.getElementById(this.getAttribute('id')).value = document.getElementById(this.getAttribute('id').replace('input-','span-')).innerHTML;
      // remove the disabled attribute and make the Edit button usable again
      document.getElementById(this.getAttribute('id').replace('input-','editButton-')).removeAttribute('disabled');
    }
  };
  td.append(span);
  td.append(input);
  tr.append(td);

  td = document.createElement('td');
  
  var editButton = document.createElement('button');
  editButton.setAttribute('type', 'button');
  editButton.setAttribute('id', 'editButton-'+id);
  editButton.classList.add('btn', 'btn-primary');
  editButton.innerHTML = 'Edit';
  editButton.onclick = function() {
    this.setAttribute('disabled', 'disabled');
    var span = document.getElementById('span-'+this.closest('tr').getAttribute('id'));
    span.classList.add('d-none');
    var input = document.getElementById('input-'+this.closest('tr').getAttribute('id'));
    input.classList.remove('d-none');
    input.focus();
    return false;
  };
  td.append(editButton);
  tr.append(td);

  var deleteButton = document.createElement('button');
  deleteButton.setAttribute('type', 'button');
  deleteButton.classList.add('btn', 'btn-danger');
  deleteButton.innerHTML = 'Delete';
  deleteButton.onclick = function() {
    deleteTask(this.closest('tr').getAttribute('id'));
    return false;
  };
  td.append(deleteButton);
  tr.append(td);

  return tr;
}
