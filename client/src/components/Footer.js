import { Typography, Link } from '@mui/material'

const Footer = () => {
	return <footer className='footer'>
		<div className='footerText'>
			<Typography
				varient='body2'
				color='textSecondary'
				margin='auto'
				width='fit-content'
			>
				{"© "}
				<Link color='inherit' href='https://github.com/erikpeik/Matcha'>
					{"Ethiopian Dating App"}
				</Link>	{" "}
				{new Date().getFullYear()}
			</Typography>
			<Typography varient='body1' color='textSecondary' align='center'>
				{"By "}
				<Link fontWeight='600' color='inherit' underline='none'
					href='https://github.com/FiranmitM'>AAiT</Link>
				{" and "}
				<Link fontWeight='600' color='inherit' underline='none'
					href='https://github.com/FiranmitM'>Software Engineering</Link>
			</Typography>
		</div>
	</footer>
}

export default Footer
