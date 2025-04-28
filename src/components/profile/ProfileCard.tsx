import { Card, CardContent } from "@/components/ui/card";
import { ProfileData } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Briefcase, GraduationCap, Link, MapPin, User } from "lucide-react";

interface ProfileCardProps {
  profile: Partial<ProfileData>;
  onEdit: () => void;
}

export default function ProfileCard({ profile, onEdit }: ProfileCardProps) {
  return (
    <Card className="mb-6 hover-card overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-500" />
      <CardContent className="p-6 -mt-12">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          {/* Profile Header */}
          <div className="mb-6 text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-200 to-purple-200 flex items-center justify-center">
              <User className="w-12 h-12 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{profile.full_name}</h3>
            <p className="text-lg text-indigo-600">{profile.title || "Add your professional title"}</p>
            <div className="flex items-center justify-center text-gray-500 mt-2">
              <MapPin className="w-4 h-4 mr-2" />
              {profile.location || "Add your location"}
            </div>
          </div>

          {/* Bio Section */}
          {profile.bio && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">About</h4>
              <p className="text-gray-600">{profile.bio}</p>
            </div>
          )}

          {/* Skills Section */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience Section */}
          {profile.experience && profile.experience.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                Experience
              </h4>
              <div className="space-y-4">
                {profile.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4">
                    <h5 className="font-medium text-gray-900">{exp.title}</h5>
                    <p className="text-gray-600">{exp.company}</p>
                    <p className="text-sm text-gray-500">
                      {exp.start_date} - {exp.end_date || 'Present'}
                    </p>
                    {exp.description && (
                      <p className="text-gray-600 mt-1 text-sm">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {profile.education && profile.education.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <GraduationCap className="w-4 h-4 mr-2" />
                Education
              </h4>
              <div className="space-y-4">
                {profile.education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4">
                    <h5 className="font-medium text-gray-900">{edu.degree}</h5>
                    <p className="text-gray-600">{edu.institution}</p>
                    <p className="text-sm text-gray-500">{edu.year}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links Section */}
          <div className="space-y-2">
            {profile.resume_url && (
              <a
                href={profile.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-indigo-600 hover:text-indigo-800"
              >
                <Link className="w-4 h-4 mr-2" />
                View Resume
              </a>
            )}
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-indigo-600 hover:text-indigo-800"
              >
                <Link className="w-4 h-4 mr-2" />
                LinkedIn Profile
              </a>
            )}
            {profile.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-indigo-600 hover:text-indigo-800"
              >
                <Link className="w-4 h-4 mr-2" />
                GitHub Profile
              </a>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-indigo-600 hover:text-indigo-800"
              >
                <Link className="w-4 h-4 mr-2" />
                Personal Website
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}