import { Classement } from '../Classement'
import APIUrl from '@/app/APIUrl'
import villesListRaw from '@/villesClassées'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Le classement des villes les plus piétonnes - villes.plus',

	description:
		'Chaque ville est testée pour déterminer le pourcentage de sa surface qui est dédié aux piétons',
	openGraph: {
		images: 'https://villes-plus.vercel.app/pietonnes.png',
	},
	twitter: {
		card: 'summary_large_image',
	},
}

const villesList = villesListRaw
	.map((element) => (typeof element === 'string' ? element : element[0]))
	.filter(Boolean)

async function getData() {
	const response = await Promise.all(
		villesList.map((ville) => {
			const url = APIUrl + `api/walking/meta/${ville}`
			return fetch(
				url,
				{ cache: 'no-store' } // I don't get why next caches a wrong version
			).then((r) => r.json().then((data) => ({ ...data, status: r.status })))
		})
	)

	return response.reduce(
		(memo, data, i) => ({ ...memo, [villesList[i]]: data }),
		{}
	)
}
export default async function Page() {
	const data = await getData()
	return <Classement data={data} />
}
