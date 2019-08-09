import faker from 'faker'
import dayjs from 'dayjs'

faker.locale = 'de'

function createSampleUsers(amount) {
  const users = []

  for (let i = 0; i < amount; i++) {
    users.push({
      id: i + 1,
      username: faker.name.findName(),
      email: faker.internet.email(),
      joinDate: dayjs(faker.date.recent(365)).format('YYYY-MM-DD')
    })
  }

  return users
}

export default createSampleUsers
