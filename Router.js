import React, { useEffect, useState } from 'react'
import {
	BrowserRouter as Router,
	Navigate,
	Route,
	Routes,
} from 'react-router-dom'
import { Classement } from './Classement'
import Cyclable from './Cyclable'
import Explications from './Explications'
import fetchExceptions from './fetchExceptions'
import { Nav } from './Nav'
import Ville from './Ville'

export default function App() {
	let [exceptions, setExceptions] = useState({})

	useEffect(() => {
		fetchExceptions().then((json) => setExceptions(json))
	}, [])

	console.log({ exceptions })

	const toggleException = (ville, id) => {
		const list = exceptions[ville] || []

		setExceptions({
			...exceptions,
			[ville]: list.includes(id) ? list.filter((e) => e !== id) : [...list, id],
		})
	}
	return (
		<Router>
			<div
				css={`
					height: 100%;
					display: flex;
					flex-direction: column;
					font-size: 110%;
				`}
			>
				<div css="flex-grow: 1; > a {text-decoration: none}">
					<Routes>
						<Route path="/piétonnes" element={<Classement />} />
						<Route path="/cyclables" element={<Cyclable />} />
						<Route path="/explications" element={<Explications />} />
						<Route
							path="/:ville"
							element={<Ville {...{ exceptions, toggleException }} />}
						/>
						<Route path="/" element={<Navigate to="/piétonnes" />} />
					</Routes>
				</div>
				<Nav />
			</div>
		</Router>
	)
}
