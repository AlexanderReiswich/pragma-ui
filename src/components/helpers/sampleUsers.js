import faker from 'faker'
import dayjs from 'dayjs'

faker.locale = 'de'

const users = []

for (let i = 0; i < 100; i++) {
  users.push({
    username: faker.name.findName(),
    email: faker.internet.email(),
    joinDate: dayjs(faker.date.recent(365)).format('YYYY-MM-DD')
  })
}

export default users
