# Instassist API
* API Summary
* API Documentation
* Query
# API Summary
## ```/projects``` and ```/tags```
***All start with ```/api/``` e.g. ```/api/projects```, ```/api/projects/:id```***
| Endpoints             | Actions | Note                                                |
|-----------------------|---------|-----------------------------------------------------|
| /projects             | GET     | Respond with a list of projects (see query) |
| /projects             | POST    | Create a new sproject. Respond with details of new project |
| /projects/:id         | GET     | Respond with details of specified project or 404 error |
| /projects/:id/popularity    | PUT     | **Increment** project's popularity by 1 |
| /projects/:id/status    | PUT     | **Toggle** project's status |
| /tags | GET  |  Get a tag list |
| /tags/:id | GET   |  Get a specific tag and its corresponding projects **(acutal projects, not just id's)** ｜
## ```/users```
```/users/{user_id}```
GET     Get a user detail
    response: user object in json format
    with valid x-access-token in header which belongs to the corresponding user: +conversation, +email

PATCH    Update a user on specific field
    request body: <field1>=<new_value>&<field2>=<new_value2>
    response: updated user object

```/login```
POST    Login
    request body: email=<email>&password=<password>
    response: Json object contains auth status, token and user object
    {auth: true, token: <token>, user: <user object>}
    {auth: false, token: null}

```/register```
POST    Register
    request body: email=<email>&password=<password>
    response: Json object contains auth status, token and user object
    {auth: true, token: <token>, user: <user object>}
    {auth: false, token: null}

## Not Implemented Yet (looks like we don't really need them anyway)
| Endpoints             | Actions | Note                                                |
|-----------------------|---------|-----------------------------------------------------|
| - [ ] projects/:id/tags    | PUT     | Replace entire tag list with supplied tag list or 404 error | 
| projects/:id/skills  | GET     | Respond with required skills of specified project or 404 error |
| projects/:id/skills  | POST    | Add a skill to specified project or 404 error  |
| projects/:id/skills  | PUT     | Replace entire skill list with supplied skill list or 404 error | 
| projects/:id/users   | GET     | Respond with a list of project members or 404 error |
| projects/:id/users   | POST    | Add a user to specified project or 404 error |
| projects/:id/users   | DELETE  | Replace entire user list with supplied user list or 404 error | 
| projects/:id         | PUT     | Replace entire project with supplied project or 404 error |
| projects/:id/tags    | POST    | Add a tag to specified project or 404 error |
| /tags | POST |   Add a tag |
| /tags/:id |DELETE | Delete a tag - [ ] ????????????????? ｜






# Documentation
## Models
### Project
| column             | type | default value | required | unique | set-able | note |
|--------------------|------|---------------|----------|--------|----------|------|
|name                |String|               | Y        | Y      | Y        |      |
|description         |String| "The creator didn't say anything about it yet" |        |       | Y        |      |
|time_created        |Date|  Date.now   |         |       |         |      |
|creator_id     |ObjectId|               | Y        | Y      | Noooo    |      |
|creator_name    |String|               | Y        |       | Y        |      |
|tags                |[ObjectId]|   [] |         |       | Y        |      |
|required_skills  |[String]|  []     |         |       | Y        |      |



### Tag
| column             | type | default value | required | unique | set-able | note |
|--------------------|------|---------------|----------|--------|----------|------|
|name                |String|               | Y        | Y      | Y        |      |
|popularity   |Number| 0 |        |       |         |      |
|projects        |[ObjectId]|     |         |       |  Y  |   ```Ref```   |


## ```/projects```
### ```/projects```
| Endpoints             | Actions | Note                                                |
|-----------------------|---------|-----------------------------------------------------|
| projects             | GET     | Respond with a list of projects (see query) |
| projects             | POST    | Create a new project. Respond with details of new project |
#### ```GET```
See **Query** section.
500 if error, 200 if OK

#### ```POST```
```javascript
{
  "name": "Lil Project", // required, unique
  "description": "A lil lil project." // default: "The creator didn't say anything about it yet", 
  // "time_created": we don't need this
  // "creator_id": we don't need this (because we got this from header x-access-token)
  // "tags": we don't need this (because we get/create these id's by tag_names)
  "tag_names": {"lil", "legit", "CS498RK", "not", "required"} 
  "creator_name": "If you can provide this info that would be awesom, otherwise we can just do query in order to get this",
  // "popularity": we don't need this
  // "status": we don't need this
  "required_skills": {"javA", "pYthoN"},
}
```
##### Effect
If posting a new project with tag_names 
* if the tag is not in the database, will create one
* if the tag already exists, add this project to tag's ```projects``` and increment ```popularity``` by 1
##### Errors
* 200 if succeed
* 500 if error, include but not limitedd to
  * failed to ```project.save()```
  * failed to save at least one of the newly-created tag
  * failed to update at least one of the existing tags (add new project to tag & increment tag's popularity by 1)
  * failed to update this project with tag_id's 

### ```/projects/:id```
| Endpoints             | Actions | Note                                                |
|-----------------------|---------|-----------------------------------------------------|
| projects/:id         | GET     | Respond with details of specified project or 404 error |

#### GET
Nothing to elaborate.
##### Error
* 200 success
* 404 Not Found
* 500 Other errors 



### ```/projects/:id/popularity```
| Endpoints             | Actions | Note                                                |
|-----------------------|---------|-----------------------------------------------------|
| /projects/:id/popularity    | PUT     | **Increment** project's popularity by 1 |
* 200 success
* 404 Not found
* 500 if fail to update

### ```/projects/:id/status```
| Endpoints             | Actions | Note                                                |
|-----------------------|---------|-----------------------------------------------------|
| /projects/:id/status    | PUT     | **Toggle** project's status |

* Authentification required (header: ```x-access-token```)
#### Error
* 200 Success
* 403 Authentification failed
* 404 Not found
* 500
  * Failed to find project for reasons other than "not found"
  * Failed to save project



## ```/tags```
### ```/tags```
| Endpoints             | Actions | Note                                                |
|-----------------------|---------|-----------------------------------------------------|
| /tags | GET  |  Get a tag list |
#### ```GET```
See **Query** section.
500 if error, 200 if OK

### ```/tags/:id```
| Endpoints             | Actions | Note                                                |
|-----------------------|---------|-----------------------------------------------------|
| /tags/:id | GET   |  Update a tag - [ ] ?????????????????|






# Query
| Parameter | Description                                 |
|----------|-------------------------------------------------------------------------------------|
| where    | filter results based on JSON query           |
| sort     | specify the order in which to sort each specified field  (1- ascending; -1 - descending)   |
| select   | specify the set of fields to include or exclude in each document  (1 - include; 0 - exclude)|
| skip     | specify the number of results to skip in the result set; useful for pagination             |
| limit    | specify the number of results to return (default should be 100 for tasks and unlimited for users)                    |
| count    | if set to true, return the count of documents that match the query (instead of the documents themselves)                    |
| page    | page number starts from 1. **Status ```400``` when page number exceeds**                    |

## Examples
Here are some example queries and what they would return:

| Query                                                                                | Description                                             |
|-----------------------------------------------------------------------------------------|---------------------------------------------------------|
| `http://www.uiucwp.com:4000/api/users?where={"_id": "55099652e5993a350458b7b7"}`         | Returns a list with a single user with the specified ID |
| `http://www.uiucwp.com:4000/api/tasks?where={"completed": true}`                          | Returns a list of completed tasks                       |
| `http://www.uiucwp.com:4000/api/tasks?where={"_id": {"$in": ["235263523","3872138723"]}}` | Returns a set of tasks                                  |
| `http://www.uiucwp.com:4000/api/users?sort={"name": 1}`                                  | Returns a list of users sorted by name                  |
| `http://www.uiucwp.com:4000/api/users?select={"_id": 0}`                                  | Returns a list of users without the _id field           |
| `http://www.uiucwp.com:4000/api/users?skip=60&limit=20`                                   | Returns user number 61 to 80                            |
### Important Note
#### ```request body```
Let's say you want to update the name for a project. Suppose you sent the request with a body like:
```
{
  'name': 'Awesome Project',
  'name': 'Even-Better Project',
  ...
}
```
The request, while sent to the backend, would be like:
```
{
  'name' : ['Awesome Project', 'Even-Better Project'],
  ...
}
```
And in the database, the corresponding project will be updated to,
```
{
  'name' : 'Awesome Project, Even-Better Project',
  ...
}
```
So if please don't do this unless you want it.  
#### Updating read-only fields
It is not allowed to update an read-only fields. Attempts to update such fields result in no effect. For example, let's say you send a ```PUT``` request to ```/tags``` endpoint (where the ```popularity``` is read-only), nothing will change and no error will be thrown.
## To Do
* Search?


## Comment


