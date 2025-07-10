import React from "react";

interface NavSocialMediaLinkProps {
  socialMediaName: string;
  image: string;
  link: string;
}

const NavSocialMediaLink: React.FC<NavSocialMediaLinkProps> = ({
  link,
  image,
  socialMediaName,
}) => {
  return (
    <a
      href={link}
      className="max-w-5 lg:hover:bg-teal-950 transition-colors duration-500 rounded-full"
      target="_blank"
    >
      <img 
      src={image} 
      alt={socialMediaName} 
      className="w-full h-full" 
      fetchPriority="high"/>
    </a>
  );
};

export default NavSocialMediaLink;
