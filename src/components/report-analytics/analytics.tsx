"use client";
import React from "react";
import {
	FaRegCommentDots,
	FaRegThumbsUp,
	FaRegShareSquare,
} from "react-icons/fa";
import { motion } from "framer-motion";
import Image from "next/image";
import FollowersChart from "./FollowersChart";

// Dummy data for demonstration
const summary = [
	{
		label: "Total Posts",
		value: "1,986",
		icon: <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M2.5 15C1.90326 15 1.33097 14.7629 0.90901 14.341C0.487053 13.919 0.25 13.3467 0.25 12.75V2.25C0.25 1.65326 0.487053 1.08097 0.90901 0.65901C1.33097 0.237053 1.90326 0 2.5 0H8.629C9.22543 0.000326264 9.79733 0.237448 10.219 0.65925L13.0915 3.53025C13.5132 3.95223 13.7501 4.52442 13.75 5.121V12.75C13.75 13.3467 13.5129 13.919 13.091 14.341C12.669 14.7629 12.0967 15 11.5 15H2.5ZM1.75 12.75C1.75 12.9489 1.82902 13.1397 1.96967 13.2803C2.11032 13.421 2.30109 13.5 2.5 13.5H11.5C11.6989 13.5 11.8897 13.421 12.0303 13.2803C12.171 13.1397 12.25 12.9489 12.25 12.75V6H10C9.40326 6 8.83097 5.76295 8.40901 5.34099C7.98705 4.91903 7.75 4.34674 7.75 3.75V1.5H2.5C2.30109 1.5 2.11032 1.57902 1.96967 1.71967C1.82902 1.86032 1.75 2.05109 1.75 2.25V12.75ZM10 4.5H11.9395L9.25 1.8105V3.75C9.25 3.94891 9.32902 4.13968 9.46967 4.28033C9.61032 4.42098 9.80109 4.5 10 4.5ZM4 7.5C3.80109 7.5 3.61032 7.57902 3.46967 7.71967C3.32902 7.86032 3.25 8.05109 3.25 8.25C3.25 8.44891 3.32902 8.63968 3.46967 8.78033C3.61032 8.92098 3.80109 9 4 9H10C10.1989 9 10.3897 8.92098 10.5303 8.78033C10.671 8.63968 10.75 8.44891 10.75 8.25C10.75 8.05109 10.671 7.86032 10.5303 7.71967C10.3897 7.57902 10.1989 7.5 10 7.5H4ZM4 10.5C3.80109 10.5 3.61032 10.579 3.46967 10.7197C3.32902 10.8603 3.25 11.0511 3.25 11.25C3.25 11.4489 3.32902 11.6397 3.46967 11.7803C3.61032 11.921 3.80109 12 4 12H7C7.19891 12 7.38968 11.921 7.53033 11.7803C7.67098 11.6397 7.75 11.4489 7.75 11.25C7.75 11.0511 7.67098 10.8603 7.53033 10.7197C7.38968 10.579 7.19891 10.5 7 10.5H4Z" fill="#849AA9"/>
		</svg>,
		change: -1.43,
	},
	{
		label: "Total Likes",
		value: "890,543",
		icon: <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M7.6945 1.24497C7.94779 0.9917 8.27499 0.825427 8.62889 0.770139C8.98279 0.714851 9.34511 0.773404 9.66358 0.937355C9.98206 1.1013 10.2402 1.36218 10.4008 1.68234C10.5615 2.00251 10.6162 2.36542 10.5573 2.71872L10.135 5.25222C11.1056 5.28719 12.0248 5.69735 12.699 6.39638C13.3733 7.0954 13.75 8.02876 13.75 8.99997V10.5C13.75 11.4945 13.3549 12.4484 12.6517 13.1516C11.9484 13.8549 10.9946 14.25 10 14.25H2.5C1.90326 14.25 1.33097 14.0129 0.90901 13.591C0.487053 13.169 0.25 12.5967 0.25 12V7.49997C0.25 6.90324 0.487053 6.33094 0.90901 5.90898C1.33097 5.48703 1.90326 5.24997 2.5 5.24997H3.6895L7.6945 1.24497ZM3.25 6.74997H2.5C2.30109 6.74997 2.11032 6.82899 1.96967 6.96964C1.82902 7.1103 1.75 7.30106 1.75 7.49997V12C1.75 12.1989 1.82902 12.3897 1.96967 12.5303C2.11032 12.671 2.30109 12.75 2.5 12.75H3.25V6.74997ZM4.75 12.75H10C10.5967 12.75 11.169 12.5129 11.591 12.091C12.0129 11.669 12.25 11.0967 12.25 10.5V8.99997C12.25 8.40324 12.0129 7.83094 11.591 7.40898C11.169 6.98703 10.5967 6.74997 10 6.74997H7.75C7.55109 6.74997 7.36032 6.67096 7.21967 6.5303C7.07902 6.38965 7 6.19889 7 5.99997C7 5.80106 7.07902 5.6103 7.21967 5.46964C7.36032 5.32899 7.55109 5.24997 7.75 5.24997H8.61475L9.0775 2.47197C9.08423 2.43214 9.07813 2.39121 9.06008 2.35507C9.04202 2.31894 9.01295 2.28947 8.97706 2.27094C8.94116 2.25241 8.90031 2.24577 8.86039 2.25198C8.82048 2.25819 8.78357 2.27692 8.755 2.30547L4.75 6.31047V12.75Z" fill="#849AA9"/>
		</svg>,
		change: -3.56,
	},
	{
		label: "Total Comments",
		value: "1,234,780",
		icon: <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M6.50048 2.25C3.90248 2.25 2.00048 4.0335 2.00048 6C2.00048 6.66 2.20523 7.28325 2.57423 7.83C2.63728 7.92329 2.67851 8.02958 2.69487 8.14097C2.71122 8.25237 2.70229 8.36603 2.66873 8.4735L2.32748 9.56775L4.04873 9.29175C4.18822 9.26931 4.33121 9.28673 4.46123 9.342C5.1066 9.61384 5.8002 9.75261 6.50048 9.75C9.09848 9.75 11.0005 7.9665 11.0005 6C11.0005 4.0335 9.09848 2.25 6.50048 2.25ZM0.500481 6C0.500481 2.99625 3.29948 0.75 6.50048 0.75C9.70148 0.75 12.5005 2.99625 12.5005 6C12.5005 9.00375 9.70148 11.25 6.50048 11.25C5.67305 11.2521 4.85232 11.1016 4.07948 10.806L1.36898 11.241C1.24282 11.2613 1.11358 11.249 0.993506 11.2053C0.873434 11.1616 0.766517 11.0879 0.682899 10.9913C0.59928 10.8947 0.541732 10.7783 0.515713 10.6532C0.489695 10.5281 0.496069 10.3984 0.534231 10.2765L1.13423 8.35425C0.72018 7.63866 0.501619 6.82675 0.500481 6Z" fill="#849AA9"/>
		<path d="M11.0561 4.65006C11.0189 4.7413 11 4.83899 11.0006 4.93754C11.0011 5.03609 11.0211 5.13356 11.0593 5.22439C11.0976 5.31521 11.1533 5.39762 11.2234 5.46688C11.2935 5.53614 11.3766 5.59091 11.4679 5.62806C13.0204 6.26031 14.0006 7.57131 14.0006 9.00006C14.0006 9.66006 13.7959 10.2833 13.4269 10.8301C13.3638 10.9233 13.3226 11.0296 13.3062 11.141C13.2899 11.2524 13.2988 11.3661 13.3324 11.4736L13.6736 12.5678L11.9524 12.2918C11.8129 12.2694 11.6699 12.2868 11.5399 12.3421C10.8945 12.6139 10.2009 12.7526 9.50062 12.7501C7.47262 12.7501 5.83087 11.6408 5.24287 10.2143C5.16709 10.0303 5.02131 9.88396 4.83762 9.80745C4.65393 9.73093 4.44737 9.73052 4.26337 9.80631C4.07938 9.88209 3.93303 10.0279 3.85651 10.2116C3.78 10.3952 3.77959 10.6018 3.85537 10.7858C4.70962 12.8551 6.95812 14.2501 9.50062 14.2501C10.3281 14.2522 11.1488 14.1017 11.9216 13.8061L14.6321 14.2411C14.7583 14.2613 14.8875 14.249 15.0076 14.2053C15.1277 14.1616 15.2346 14.088 15.3182 13.9914C15.4018 13.8947 15.4594 13.7784 15.4854 13.6533C15.5114 13.5282 15.505 13.3985 15.4669 13.2766L14.8669 11.3543C15.2809 10.6387 15.4995 9.8268 15.5006 9.00006C15.5006 6.83856 14.0284 5.05056 12.0334 4.23831C11.9421 4.20122 11.8445 4.18246 11.746 4.18312C11.6475 4.18378 11.5501 4.20383 11.4593 4.24214C11.3686 4.28044 11.2862 4.33625 11.2171 4.40637C11.1479 4.47649 11.0932 4.55955 11.0561 4.65081V4.65006Z" fill="#849AA9"/>
		</svg>,
		change: 0.94,
	},
	{
		label: "Total Shares",
		value: "432,097",
		icon: <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M0.6838 14.7412C0.58655 14.6293 0.52467 14.491 0.505981 14.3439C0.487291 14.1968 0.512632 14.0474 0.5788 13.9147L7.3288 0.414718C7.391 0.289913 7.48677 0.18492 7.60534 0.111533C7.72392 0.0381446 7.8606 -0.000732422 8.00005 -0.000732422C8.1395 -0.000732422 8.27618 0.0381446 8.39476 0.111533C8.51333 0.18492 8.6091 0.289913 8.6713 0.414718L15.4213 13.9147C15.4877 14.0474 15.5132 14.1968 15.4947 14.3441C15.4762 14.4913 15.4144 14.6297 15.3171 14.7418C15.2199 14.8539 15.0916 14.9346 14.9485 14.9738C14.8053 15.0129 14.6538 15.0087 14.5131 14.9617L8.00005 12.7905L1.48705 14.9617C1.34636 15.0085 1.19497 15.0125 1.052 14.9732C0.909033 14.934 0.780904 14.8532 0.6838 14.7412ZM8.75005 11.46L13.2695 12.9667L8.00005 2.42697L2.73055 12.966L7.25005 11.4592V7.49997C7.25005 7.30105 7.32907 7.11029 7.46972 6.96964C7.61037 6.82899 7.80114 6.74997 8.00005 6.74997C8.19896 6.74997 8.38973 6.82899 8.53038 6.96964C8.67103 7.11029 8.75005 7.30105 8.75005 7.49997V11.46Z" fill="#849AA9"/>
		</svg>,
		change: -0.2,
	},
];


const socialAudience = {
	total: 20453,
	change: 14,
	breakdown: [
		{ label: "Facebook", value: 12231, color: "#2870F3", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
			<g clipPath="url(#clip0_8552_3653)">
			<path fillRule="evenodd" clipRule="evenodd" d="M17.5565 0C18.9051 0 20 1.09492 20 2.44352V17.5565C20 18.9051 18.9051 20 17.5565 20H13.3976V12.4643H15.9991L16.4941 9.23688H13.3976V7.14246C13.3976 6.25953 13.8301 5.39887 15.2171 5.39887H16.625V2.65121C16.625 2.65121 15.3473 2.43316 14.1257 2.43316C11.5754 2.43316 9.90852 3.97883 9.90852 6.77707V9.23688H7.07363V12.4643H9.90852V20H2.44352C1.09492 20 0 18.9051 0 17.5565V2.44352C0 1.09492 1.09488 0 2.44352 0L17.5565 0Z" fill="#1777F2"/>
			</g>
			<defs>
			<clipPath id="clip0_8552_3653">
			<rect width="20" height="20" rx="1" fill="white"/>
			</clipPath>
			</defs>
			</svg>
			 },
		{ label: "Twitter", value: 4507, color: "#939393", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
			<g clipPath="url(#clip0_8552_3659)">
			<path d="M11.7459 8.59711L18.5716 0.833374H16.9544L11.0249 7.57311L6.29252 0.833374H0.833008L7.99091 11.026L0.833008 19.1667H2.45027L8.70808 12.0477L13.7068 19.1667H19.1663L11.7459 8.59711ZM9.53011 11.1154L8.80376 10.0998L3.0335 2.02638H5.51795L10.1761 8.54434L10.8994 9.55993L16.9536 18.0318H14.4692L9.53011 11.1154Z" fill="black"/>
			</g>
			<defs>
			<clipPath id="clip0_8552_3659">
			<rect width="20" height="20" fill="white"/>
			</clipPath>
			</defs>
			</svg>
			 },
		{ label: "Instagram", value: 3584, color: "#CB007E", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
			<g clipPath="url(#clip0_8552_3665)">
			<path d="M10 20C4.478 20 0 15.522 0 10C0 4.478 4.478 0 10 0C15.522 0 20 4.478 20 10C20 15.522 15.522 20 10 20Z" fill="url(#paint0_linear_8552_3665)"/>
			<path d="M9.99987 4.40395C11.8219 4.40395 12.0379 4.40995 12.7579 4.44395C13.4239 4.47395 13.7859 4.58595 14.0259 4.67995C14.3439 4.80395 14.5719 4.95195 14.8099 5.18995C15.0479 5.42795 15.1959 5.65595 15.3199 5.97395C15.4139 6.21395 15.5239 6.57595 15.5559 7.24195C15.5879 7.96195 15.5959 8.17795 15.5959 9.99995C15.5959 11.8219 15.5899 12.038 15.5559 12.7579C15.5259 13.424 15.4139 13.7859 15.3199 14.0259C15.1959 14.3439 15.0479 14.5719 14.8099 14.8099C14.5719 15.0479 14.3439 15.1959 14.0259 15.32C13.7859 15.4139 13.4239 15.5239 12.7579 15.5559C12.0379 15.5879 11.8219 15.5959 9.99987 15.5959C8.17787 15.5959 7.96187 15.5899 7.24187 15.5559C6.57588 15.5259 6.21388 15.4139 5.97388 15.32C5.65587 15.1959 5.42787 15.0479 5.18987 14.8099C4.95187 14.5719 4.80387 14.3439 4.67987 14.0259C4.58587 13.7859 4.47587 13.424 4.44387 12.7579C4.41187 12.038 4.40387 11.8219 4.40387 9.99995C4.40387 8.17795 4.40987 7.96195 4.44387 7.24195C4.47387 6.57595 4.58587 6.21395 4.67987 5.97395C4.80387 5.65595 4.95187 5.42795 5.18987 5.18995C5.42787 4.95195 5.65587 4.80395 5.97388 4.67995C6.21388 4.58595 6.57588 4.47595 7.24187 4.44395C7.96187 4.40995 8.17787 4.40395 9.99987 4.40395ZM9.99987 3.17395C8.14587 3.17395 7.91387 3.18195 7.18587 3.21595C6.45987 3.24995 5.96387 3.36395 5.52787 3.53395C5.07987 3.70595 4.69787 3.93995 4.31987 4.31995C3.93987 4.69995 3.70788 5.07995 3.53187 5.52995C3.36388 5.96395 3.24787 6.45995 3.21387 7.18795C3.17987 7.91595 3.17188 8.14795 3.17188 10.002C3.17188 11.856 3.17987 12.0879 3.21387 12.8159C3.24787 13.5419 3.36187 14.0379 3.53187 14.474C3.70587 14.9199 3.93987 15.3019 4.31987 15.6799C4.69987 16.0599 5.07987 16.292 5.52987 16.4679C5.96387 16.636 6.45987 16.7519 7.18787 16.7859C7.91587 16.8199 8.14787 16.828 10.0019 16.828C11.8559 16.828 12.0879 16.8199 12.8159 16.7859C13.5419 16.7519 14.0379 16.6379 14.4739 16.4679C14.9199 16.294 15.3019 16.0599 15.6799 15.6799C16.0599 15.2999 16.2919 14.9199 16.4679 14.4699C16.6359 14.0359 16.7519 13.5399 16.7859 12.8119C16.8199 12.0839 16.8279 11.852 16.8279 9.99795C16.8279 8.14395 16.8199 7.91195 16.7859 7.18395C16.7519 6.45795 16.6379 5.96195 16.4679 5.52595C16.2939 5.07995 16.0599 4.69795 15.6799 4.31995C15.2999 3.93995 14.9199 3.70795 14.4699 3.53195C14.0359 3.36395 13.5399 3.24795 12.8119 3.21395C12.0859 3.18195 11.8539 3.17395 9.99987 3.17395Z" fill="white"/>
			<path d="M10.0001 6.4939C8.06414 6.4939 6.49414 8.0639 6.49414 9.9999C6.49414 11.9359 8.06414 13.5059 10.0001 13.5059C11.9361 13.5059 13.5061 11.9359 13.5061 9.9999C13.5061 8.0639 11.9361 6.4939 10.0001 6.4939ZM10.0001 12.2759C8.74414 12.2759 7.72414 11.2579 7.72414 9.9999C7.72414 8.7419 8.74414 7.7239 10.0001 7.7239C11.2561 7.7239 12.2761 8.7419 12.2761 9.9999C12.2761 11.2579 11.2561 12.2759 10.0001 12.2759Z" fill="white"/>
			<path d="M13.6442 7.17601C14.0971 7.17601 14.4642 6.80888 14.4642 6.35601C14.4642 5.90314 14.0971 5.53601 13.6442 5.53601C13.1913 5.53601 12.8242 5.90314 12.8242 6.35601C12.8242 6.80888 13.1913 7.17601 13.6442 7.17601Z" fill="white"/>
			</g>
			<defs>
			<linearGradient id="paint0_linear_8552_3665" x1="2.92893" y1="17.0711" x2="17.0711" y2="2.92893" gradientUnits="userSpaceOnUse">
			<stop stopColor="#FFD521"/>
			<stop offset="0.0551048" stopColor="#FFD020"/>
			<stop offset="0.1241" stopColor="#FEC01E"/>
			<stop offset="0.2004" stopColor="#FCA71B"/>
			<stop offset="0.2821" stopColor="#FA8316"/>
			<stop offset="0.3681" stopColor="#F85510"/>
			<stop offset="0.4563" stopColor="#F51E09"/>
			<stop offset="0.5" stopColor="#F30005"/>
			<stop offset="0.5035" stopColor="#F20007"/>
			<stop offset="0.5966" stopColor="#E1003B"/>
			<stop offset="0.6879" stopColor="#D30067"/>
			<stop offset="0.7757" stopColor="#C70088"/>
			<stop offset="0.8589" stopColor="#BF00A0"/>
			<stop offset="0.9357" stopColor="#BB00AF"/>
			<stop offset="1" stopColor="#B900B4"/>
			</linearGradient>
			<clipPath id="clip0_8552_3665">
			<rect width="20" height="20" fill="white"/>
			</clipPath>
			</defs>
			</svg>
			 },
	],
};

const topPost = {
	image: "/public/images/home-background-img.png",
	name: "Video Name",
	date: "15 May 2020 10:00 pm",
	likes: 1656,
	comments: 379,
	shares: 10,
};

const cardVariants = {
	hidden: { opacity: 0, y: 40 },
	visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } }),
};

export default function AnalyticsDashboard() {
	const isEmptyState = false;

	return (
		<div className="w-full bg-white/90 py-8 px-2 md:px-8 flex flex-col items-center">
			{/* Header */}
			<div className="max-w-[1260px] w-full mx-auto">
				<h1 className="text-3xl md:text-[42px] font-semibold text-center text-[#171717] mb-2">Reports and Analytics</h1>
				<p className="text-center text-[#5F5F5F] text-xl mb-8">
				Track engagement and reach on your latest content.
					</p>
				
				{/* Information Banner for Empty State */}
				{isEmptyState && (
					<div className="bg-[#EF99431A] rounded-lg px-4 py-2 mb-8 max-w-fit mx-auto">
						<p className="text-center text-[#EF9943] text-lg font-normal">
							Your content is lined up and stats will be updated after 24 hours
						</p>
					</div>
				)}
				{/* Summary Cards */}
				<div className="flex flex-wrap justify-center gap-4 mb-8">
					{summary.map((item, i) => (
						<motion.div
							key={item.label}
							className="bg-white rounded-[10px] p-[13px] flex flex-col justify-between items-start border border-[#F1F1F4] max-w-[303px] w-full"
							custom={i}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, amount: 0.5 }}
							variants={cardVariants}
							style={{ boxShadow: "0px 5px 20px 0px #0000000D" }}
						>
							<div className="flex items-center justify-between w-full gap-2">
								<span className="text-base font-normal text-[#5F5F5F]">{item.label}</span>
								<div className="flex items-center gap-2 text-gray-400 mb-2">{item.icon}</div>
								
							</div>
							<div className="flex items-center justify-between w-full gap-2">
							<div className="text-xl md:text-[24px] font-medium text-[#282828]">{isEmptyState ? "--" : item.value}</div>
								
								{!isEmptyState && (
									<div className={`text-sm font-extrabold ${item.change >= 0 ? "text-[#2CDDC7]" : "text-[#FF3131]"}`}>{item.change >= 0 ? "+" : ""}{item.change}%</div>
								)}
							</div>
						</motion.div>
					))}
				</div>
				{/* Main Content Grid */}
				<div className="flex xl:flex-nowrap flex-wrap gap-2">
					<div className="xl:w-[60%] w-full">
					{/* Followers Chart */}
					    <FollowersChart isEmptyState={isEmptyState} />
					</div>
					<div className="xl:w-[40%] w-full flex md:flex-row flex-col gap-2">
					{/* Social Media Audience */}
					<motion.div
						className="bg-white rounded-[10px] h-fit border border-[#F1F1F4] p-4 flex flex-col gap-2 w-full"
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.5 }}
						transition={{ duration: 0.6 }}
						style={{ boxShadow: "0px 5px 20px 0px #0000000D" }}
					>
						<h2 className="text-lg font-medium text-[#282828] mb-0">Social Media Audience</h2>
						
						{/* Total Audience with Growth Indicator */}
						<div className="flex items-center gap-3 mb-3">
							<span className="text-[24px] font-semibold text-[#120F43]">{isEmptyState ? "--" : socialAudience.total.toLocaleString()}</span>
							{!isEmptyState && (
								<span className="bg-green-100 text-[#0CCC1E] border border-[#0CCC1E80] rounded-[8px] px-2 py-[2px] text-sm font-semibold flex items-center gap-1">
									<span className="text-[#0CCC1E]">↑</span> {socialAudience.change}%
								</span>
							)}
						</div>

						{/* Distribution Bar */}
						<div className="w-full h-[7px] overflow-hidden mb-3">
							<div className="flex h-full gap-x-1">
								<div className="bg-[#2870F3] rounded-full" style={{ width: `${(socialAudience.breakdown[0].value / socialAudience.total) * 100}%` }}></div>
								<div className="bg-[#939393] rounded-full" style={{ width: `${(socialAudience.breakdown[1].value / socialAudience.total) * 100}%` }}></div>
								<div className="bg-[#E1306C] rounded-full" style={{ width: `${(socialAudience.breakdown[2].value / socialAudience.total) * 100}%` }}></div>
							</div>
						</div>


						{/* Legend */}
						<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
							{socialAudience.breakdown.map((s) => (
								<div key={s.label} className="flex items-center gap-2">
									<div className="w-[10px] h-[10px] rounded-full" style={{ backgroundColor: s.color }}></div>
									<span className="text-sm text-[#2A2F5B] font-medium">{s.label}</span>
								</div>
							))}
						</div>

						<div className="h-[1px] border border-[#E5E7EB] my-2"></div>

						{/* Platform Breakdown */}
						<div className="flex flex-col gap-3">
							{socialAudience.breakdown.map((s) => (
								<div key={s.label} className="flex items-center justify-between">
									<div className="flex items-center gap-0">
										<div className="w-8 h-8 rounded flex items-center justify-center" >
									{s.icon}
										</div>
										<span className="text-[#2A2F5B] text-sm font-medium">{s.label}</span>
									</div>
									<span className="text-[#2A2F5B] font-medium text-sm">{isEmptyState ? "--" : s.value.toLocaleString()}</span>
								</div>
							))}
						</div>
					</motion.div>

					{/* Top Post */}
					<motion.div
						className="bg-white rounded-[10px] h-fit p-[13px] flex flex-col items-start border border-[#F1F1F4] md:max-w-[303px] max-w-full w-full"
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.5 }}
						transition={{ duration: 0.7 }}
						style={{ boxShadow: "0px 5px 20px 0px #0000000D" }}
					>
						<h2 className="text-lg font-medium text-[#282828] mb-[13px]">Top Post</h2>
						
						{/* Post Image */}
						<div className="w-full rounded-[8px] overflow-hidden mb-3 bg-gray-100">
							{isEmptyState ? (
								<div className="w-full h-[138px] bg-gray-200 flex items-center justify-center">
									<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M4 16L8 12L12 16L20 8" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
										<path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#9CA3AF" strokeWidth="2"/>
									</svg>
								</div>
							) : (
								<Image src="/images/Form.png" alt="Top Post" width={208} height={138} className="object-cover w-full h-full" />
							)}
						</div>
						
						{/* Post Title */}
						<div className="text-lg font-semibold text-[#171717] mb-2">{topPost.name}</div>
						
						{/* Date */}
						<div className="flex items-center gap-2 text-sm text-[#171717] mb-4 font-medium">
							<span><svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M6.9987 0.333374C10.6807 0.333374 13.6654 3.31804 13.6654 7.00004C13.6654 10.682 10.6807 13.6667 6.9987 13.6667C3.3167 13.6667 0.332031 10.682 0.332031 7.00004C0.332031 3.31804 3.3167 0.333374 6.9987 0.333374ZM6.9987 1.66671C5.58421 1.66671 4.22766 2.22861 3.22746 3.2288C2.22727 4.229 1.66536 5.58555 1.66536 7.00004C1.66536 8.41453 2.22727 9.77108 3.22746 10.7713C4.22766 11.7715 5.58421 12.3334 6.9987 12.3334C8.41319 12.3334 9.76974 11.7715 10.7699 10.7713C11.7701 9.77108 12.332 8.41453 12.332 7.00004C12.332 5.58555 11.7701 4.229 10.7699 3.2288C9.76974 2.22861 8.41319 1.66671 6.9987 1.66671ZM6.9987 3.00004C7.16199 3.00006 7.31959 3.06001 7.44161 3.16852C7.56364 3.27702 7.64159 3.42654 7.6607 3.58871L7.66536 3.66671V6.72404L9.47003 8.52871C9.5896 8.64868 9.65901 8.80966 9.66418 8.97896C9.66935 9.14826 9.60989 9.31318 9.49786 9.44023C9.38584 9.56727 9.22966 9.64691 9.06105 9.66297C8.89243 9.67904 8.72402 9.63031 8.59003 9.52671L8.52736 9.47137L6.52736 7.47137C6.42375 7.36767 6.35721 7.23271 6.33803 7.08737L6.33203 7.00004V3.66671C6.33203 3.4899 6.40227 3.32033 6.52729 3.1953C6.65232 3.07028 6.82189 3.00004 6.9987 3.00004Z" fill="#5F5F5F"/>
								</svg>
								</span>
							<span>{isEmptyState ? "--" : topPost.date}</span>
						</div>

						{/* Separator */}
						<div className="w-full h-[2px] bg-[#E5E7EB] mb-4"></div>
						
						{/* Engagement Metrics */}
						<div className="flex justify-between w-full">
							<div className="flex flex-col items-center gap-0">
								<span className="text-[10px] text-[#858999] font-medium">Likes</span>
								<div className="flex items-center gap-1">
									<FaRegThumbsUp className="text-sm text-[#282828]" />
									<span className="font-medium text-base text-[#282828]">{isEmptyState ? "--" : topPost.likes.toLocaleString()}</span>
								</div>
							</div>
							<div className="flex flex-col items-center gap-0">
								<span className="text-[10px] text-[#858999] font-medium">Comments</span>
								<div className="flex items-center gap-1">
									<FaRegCommentDots className="text-sm text-[#282828]" />
									<span className="font-medium text-base text-[#282828]">{isEmptyState ? "--" : topPost.comments.toLocaleString()}</span>
								</div>
							</div>
							<div className="flex flex-col items-center gap-0">
								<span className="text-[10px] text-[#858999] font-medium">Shares</span>
								<div className="flex items-center gap-1">
									<FaRegShareSquare className="text-sm text-[#282828]" />
									<span className="font-medium text-base text-[#282828]">{isEmptyState ? "--" : topPost.shares.toLocaleString()}</span>
								</div>
							</div>
						</div>
					</motion.div>
					</div>
				</div>
			</div>
		</div>
	);
}
