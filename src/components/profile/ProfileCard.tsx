import { Card, CardContent } from "@/components/ui/card";
import { ProfileData } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface ProfileCardProps {
  profile: Partial<ProfileData>;
  onEdit: () => void;
}

export default function ProfileCard({ profile, onEdit }: ProfileCardProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{profile.full_name}</h3>
            <p className="text-lg text-gray-600">{profile.title || "Add your professional title"}</p>
            <p className="text-gray-500">{profile.location || "Add your location"}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        <div className="space-y-6">
          {/* Bio Section */}
          <div>
            <h4 className="text-lg font-medium mb-2">About</h4>
            <p className="text-gray-600">
              {profile.bio || "Add a bio to tell employers about yourself"}
            </p>
          </div>

          {/* Skills Section */}
          <div>
            <h4 className="text-lg font-medium mb-2">Skills</h4>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Add your skills to stand out</p>
            )}
          </div>

          {/* Experience Section */}
          <div>
            <h4 className="text-lg font-medium mb-2">Experience</h4>
            {profile.experience && profile.experience.length > 0 ? (
              <div className="space-y-4">
                {profile.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4">
                    <h5 className="font-medium text-gray-900">{exp.title}</h5>
                    <p className="text-gray-600">{exp.company}</p>
                    <p className="text-sm text-gray-500">
                      {exp.start_date} - {exp.end_date || 'Present'}
                    </p>
                    <p className="text-gray-600 mt-1">{exp.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Add your work experience</p>
            )}
          </div>

          {/* Education Section */}
          <div>
            <h4 className="text-lg font-medium mb-2">Education</h4>
            {profile.education && profile.education.length > 0 ? (
              <div className="space-y-4">
                {profile.education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4">
                    <h5 className="font-medium text-gray-900">{edu.degree}</h5>
                    <p className="text-gray-600">{edu.institution}</p>
                    <p className="text-sm text-gray-500">{edu.year}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Add your educational background</p>
            )}
          </div>

          {/* Links Section */}
          <div>
            <h4 className="text-lg font-medium mb-2">Professional Links</h4>
            <div className="space-y-2">
              {profile.linkedin_url ? (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" 
                   className="text-indigo-600 hover:underline block">
                  LinkedIn Profile
                </a>
              ) : null}
              {profile.github_url ? (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                   className="text-indigo-600 hover:underline block">
                  GitHub Profile
                </a>
              ) : null}
              {profile.website ? (
                <a href={profile.website} target="_blank" rel="noopener noreferrer"
                   className="text-indigo-600 hover:underline block">
                  Personal Website
                </a>
              ) : null}
              {!profile.linkedin_url && !profile.github_url && !profile.website && (
                <p className="text-gray-500">Add your professional links</p>
              )}
            </div>
          </div>

          {/* Resume Section */}
          <div>
            <h4 className="text-lg font-medium mb-2">Resume</h4>
            {profile.resume_url ? (
              <a
                href={profile.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline inline-flex items-center"
              >
                View Resume
              </a>
            ) : (
              <p className="text-gray-500">Upload your resume</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}