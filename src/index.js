const form = $('form').get(0)
const button = $('.btn-request').get(0)

const loaderActive = () => $('.loader').toggleClass('_active')
const clearForm = () => form.reset()
const buttonActive = () =>
	button.disabled === true
		? (button.disabled = false)
		: (button.disabled = true)

class BaseService {
	constructor() {
		this.url = 'https://jsonplaceholder.typicode.com'
		this.statusCodes = {
			UNSENT: 0,
			OPENED: 1,
			HEADERS_RECEIVED: 2,
			LOADING: 3,
			DONE: 4,
		}
	}

	wait(delay) {
		return new Promise((resolve) => setTimeout(resolve, delay))
	}

	request(payload) {
		const { url, method, options } = payload

		const xhr = new XMLHttpRequest()

		return new Promise((resolve, reject) => {
			if (options.responseType) {
				xhr.responseType = options.responseType
			}

			xhr.open(method, url, true)
			xhr.send()

			xhr.onreadystatechange = () => {
				if (xhr.readyState !== this.statusCodes.DONE) {
					return
				}

				if (xhr.status === 200) {
					resolve(xhr.response)
				} else {
					reject(xhr.response)
				}
			}
		})
	}
}

class UserService extends BaseService {
	constructor(options) {
		super()

		this.action = 'users'
		this._username = options.username
		this._password = options.password
	}

	get username() {
		return this._username
	}

	get password() {
		throw new Error("you don't allow")
	}

	set username(value) {
		this._username = value
	}

	set password(value) {
		this._password = value
	}

	async authenticate(payload = {}) {
		const { delay = 2000 } = payload
		const requestPayload = {
			method: 'GET',
			url: `${this.url}/${this.action}?username=${this._username}&password=${this._password}`,
			options: {
				responseType: 'json',
			},
		}

		try {
			const [result] = await Promise.all([
				this.request(requestPayload),
				this.wait(delay),
			])

			return result
		} catch (error) {
			throw error
		}
	}
}

const userService = new UserService({})

async function handleClick() {
	try {
		loaderActive()
		buttonActive()
		userService.username = $('[name="name"]').val()
		userService.password = $('[name="password"]').val()
		const result = await userService.authenticate()

		console.log('result', result)
	} catch (error) {
		console.log('error', error)
	} finally {
		loaderActive()
		buttonActive()
		clearForm()
	}
}

if (button) {
	$(button).click(handleClick)
}
