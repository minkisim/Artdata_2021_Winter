drop table if exists user_inform;
drop table if exists user_preference;
drop table if exists auction cascade;
drop table if exists user_bid cascade;
drop table if exists art cascade;
drop table if exists artist cascade;
drop table if exists board cascade;
drop table if exists artuser cascade;
drop table if exists exhibition cascade;
drop table if exists notification cascade;


create table artuser (
	username	varchar(30)	not null,
	name		varchar(30)	not null,
	password		varchar(30)	not null,
	email		varchar(30)	not null,
	phone		varchar(30),
	role		varchar(10)	not null check(role = 'role_admin' or role = 'role_user'),
	gender		varchar(1)	check(gender = 'm' or gender = 'f'),
	age		int		not null,
	primary key (username)
	
);



create table exhibition (
	exhibition_id	int		not null,
	exhibition_name	varchar(30)	not null,
	exhibition_data	text,
	primary key (exhibition_id)
);

create table artist (
		artist_id		int		not null,
		artist_name	varchar(30)	not null,
		artist_info	text,
		life_term		text,
		artist_career	text,
		primary key (artist_id)
	);

create table art (
		art_id		int		not null,
		art_name		varchar(100)	not null,
		release_date	date,
		image_size	varchar(30)	not null,
		image_url		varchar(255)	not null,
		image_type	varchar(30),
		art_text		text,
		usd_upper	int		not null,
		usd_lower	int		not null,
		krw_upper	int		not null,
		krw_lower	int		not null,
		displaydate	text,
		remaintime	int,		
		audience_number	int,
		artist_id		int		not null,
		exhibition_id	int,
		owner_username	varchar(30),
		expired		date,
		primary key (art_id),
		foreign key (owner_username) references artuser(username) on update set null on delete set null,
		foreign key (artist_id) references artist(artist_id),
		foreign key (exhibition_id) references exhibition(exhibition_id) on update set null on delete set null,
		check (usd_upper >= usd_lower),
		check (krw_upper >= krw_lower)
	);

create table auction (
		auction_id	int		not null,
		auction_unit	int		not null,
		begin_point	date		not null,
		end_point	date		not null,
		begin_price	int		not null,
		accepted_price	int,
		manager		varchar(30)	not null,
		artist_id		int		not null,
		art_id		int		not null,
		primary key (auction_id),
		foreign key (artist_id) references artist(artist_id),
		foreign key (art_id) references art(art_id),
		foreign key (manager) references artuser(username),

		unique (art_id),
		check (begin_point < end_point)
	);

create table user_bid (
		username	varchar(30)	not null,
		user_price	int		not null,
		bid_date		date		not null,
		art_id		int		not null,

		primary key (username, art_id),
		foreign key (username) references artuser(username) on delete cascade,
		foreign key (art_id) references art(art_id)
	);

create table board (
		username	varchar(30)	not null,
		indices		int		not null,
		manager		varchar(30),
		boardtype	varchar(30)	not null,
		title		text		not null,
		bodytext		text		not null,
		uploaddate	date		not null,
		answer		text,
		answerdate	date,
		primary key (username, indices),
		foreign key (username) references artuser(username) on delete cascade,
		foreign key (manager) references artuser(username) on delete cascade
);

create table notification (
	id		int			not null,
	title		text			not null,
	bodytext		text			not null,
	uploaddate	date			not null,
	hits		int			not null	default 0,
	primary key (id)
);

create table user_preference (
	username	varchar(30)		not null,
	art_id		int			not null,
	access_time	date			not null,
	hits		int			not null default 0,
	gender		varchar(1)	check(gender = 'm' or gender = 'f'),
	age		int			not null,
	primary key (username, art_id, access_time),
	foreign key (username) references artuser(username) on delete cascade,
	foreign key (art_id) references art(art_id) on delete cascade
);

create table user_inform (
	username	varchar(30)		not null,
	inform_text	text			not null,
	inform_date	date			not null,
	inform_time	time,
	art_id		int			not null,
	auction_type	int			not null,
	confirm		boolean			default false,
	primary key (username, inform_date, inform_time, art_id, auction_type),
	foreign key (username) references artuser(username) on delete cascade,
	foreign key (art_id) references art(art_id) on delete cascade
);

