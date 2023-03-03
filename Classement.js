import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import APIUrl from './APIUrl'
import CityResult from './CityResult'
import Logo from './Logo'
import villesListRaw from './villesClassées'
import algorithmVersion from './algorithmVersion'

export const normalizedScores = (data) => {
	const million = 1000 * 1000
	const pedestrianArea = data.pedestrianArea / million,
		relativeArea = data.relativeArea / million,
		area = data.geoAPI.surface / 100, // looks to be defined in the 'hectares' unit
		percentage = (pedestrianArea / relativeArea) * 100
	return { pedestrianArea, area, relativeArea, percentage }
}

export function Classement({ cyclable }) {
	const villesList = villesListRaw
		.map((element) =>
			typeof element === 'string'
				? cyclable
					? null
					: element
				: cyclable
				? element[1]
				: element[0]
		)
		.filter(Boolean)
	const [villes, setVilles] = useState(
		Object.fromEntries(villesList.map((key) => [key, null]))
	)

	useEffect(() => {
		const promises = villesList.map((ville) =>
			fetch(
				APIUrl + `api/${cyclable ? 'cycling' : 'walking'}/meta/${ville}`
			).then((yo) => yo.json())
		)
		promises.map((promise, i) =>
			promise.then((data) => {
				setVilles((villes) => ({ ...villes, [villesList[i]]: data }))
			})
		)
	}, [])

	let villesEntries = Object.entries(villes)

	return (
		<>
			<Logo animate cyclable={cyclable} />
			<div
				css={`
					max-width: 45rem;
					margin: 0 auto;
					padding: 0.6rem;
					h2 {
						font-size: 120%;
						font-weight: normal;
						text-align: center;
					}
					> ol {
						padding: 0;
						margin-top: 2rem;
					}

					> ol > li {
						list-style-type: none;
					}

					> ol > li > a {
						display: flex;
						justify-content: space-between;
						margin: 0.8rem 0;
					}

					li a {
						color: inherit;
					}
					/*
				li:nth-child(odd) {
					background: #eee;
				}
				*/
					a {
						font-size: 100%;
						text-decoration: none;
					}
					strong {
						background: yellow;
						font-weight: 600;
					}
				`}
			>
				<h2>
					{cyclable
						? 'Quelles métropoles françaises sont les plus cyclables ?'
						: 'Quelles grandes villes françaises sont les plus piétonnes ?'}
				</h2>
				<p css="text-align: center">
					🗓️{' '}
					{new Date().toLocaleString('fr-FR', {
						month: 'long',
						year: 'numeric',
					})}{' '}
					- {cyclable ? algorithmVersion : 'v1'}
				</p>
				{villesEntries.length === 0 && (
					<p css="font-weight: 600; margin-top: 3rem; text-align: center">
						Chargement en cours ⏳
					</p>
				)}
				{
					<ol>
						{villesEntries
							.map(([ville, data]) => {
								if (cyclable) return [ville, data]
								if (!data || !data.geoAPI)
									return [ville, { percentage: -Infinity }]
								return [ville, { ...data, ...normalizedScores(data) }]
							})
							.sort(([, v1], [, v2]) =>
								cyclable
									? v2?.score - v1?.score
									: v2?.percentage - v1?.percentage
							)
							.map(([ville, data], i) => {
								return (
									<CityResult {...{ key: ville, ville, cyclable, data, i }} />
								)
							})}
					</ol>
				}
			</div>
		</>
	)
}
