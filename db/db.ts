const USERS:any[] = []

function getUserByEmail(email:string) {
  return USERS.find(user => user.email === email)
}

function getUserById(id:string) {
  return USERS.find(user => user.id === id)
}

function createUser(id:string, email:string, passKey:any) {
  USERS.push({ id, email, passKey })
}

function updateUserCounter(id:string, counter:any) {
  const user = USERS.find(user => user.id === id)
  user.passKey.counter = counter
}

export { createUser, getUserByEmail, getUserById, updateUserCounter }