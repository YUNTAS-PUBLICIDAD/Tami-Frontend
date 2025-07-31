import React from "react";

interface NavSocialMediaLinkProps {
  socialMediaName: string;
  image: string;
  url: string;
  imageTitle: string;
  linkTitle: string; 
}

const NavSocialMediaLink: React.FC<NavSocialMediaLinkProps> = ({
  url,
  image,
  socialMediaName,
  imageTitle,
  linkTitle ,
}) => {
  return (
    <a
      href={url}
      className="max-w-5 lg:hover:bg-teal-950 transition-colors duration-500 rounded-full"
      target="_blank"
      title={linkTitle}
    >
      <img 
      src={image} 
      alt={socialMediaName} 
      className="w-6 h-6" 
      fetchPriority="high"
      width = "24"
      height = "24"
      style={{ aspectRatio: '1/1' }}
      title={imageTitle}
      />
      
    </a>
  );
};

export default NavSocialMediaLink;
