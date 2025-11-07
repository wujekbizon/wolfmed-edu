// Empty module used to replace server-only modules on client side
export class JsonDatabase {
  static getInstance() {
    throw new Error('JsonDatabase is not available on the client side')
  }
}

export default {}
