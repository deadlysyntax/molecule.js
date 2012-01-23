require 'rubygems'
require 'net/ssh'
require 'net/sftp'
require 'git'

class Wingman
  
  def initialize(options, timestamp)
    @ssh_host      = options[:ssh_host]
    @ssh_user      = options[:ssh_user]
    @ssh_pass      = options[:ssh_pass]
    @ssh_port      = options[:ssh_port]
    @mysql_db      = options[:mysql_db]
    @mysql_user    = options[:mysql_user]
    @mysql_pass    = options[:mysql_pass]
    @remote_path   = options[:remote_path]
    @local_path    = options[:local_path ]
    @timestamp     = timestamp
  end


  def back_me_up
    puts "Connecting to server: #{@ssh_host}"
    Net::SSH.start(@ssh_host, @ssh_user, {:port => @ssh_port, :password => @ssh_pass}) do |ssh|

      puts "Backing up database: #{@remote_path}/#{@ssh_host}_#{@mysql_db}_#{@timestamp}.sql"
      ssh.exec!("mysqldump -u #{@mysql_user} --password=#{@mysql_pass} #{@mysql_db} > #{@remote_path}/#{@ssh_host}_#{@mysql_db}_#{@timestamp}.sql")

      puts "Compressing database."
      ssh.exec!("zip #{@remote_path}/#{@ssh_host}_#{@mysql_db}_#{@timestamp}.sql.zip #{@remote_path}/#{@ssh_host}_#{@mysql_db}_#{@timestamp}.sql")

      puts "Downloading backup copy of database."
      ssh.sftp.download!("#{@remote_path}/#{@ssh_host}_#{@mysql_db}_#{@timestamp}.sql.zip", "#{@local_path}/#{@ssh_host}_#{@mysql_db}_#{@timestamp}.sql.zip")
  
      puts "Cleaning up temporary files."
      ssh.exec!("rm #{@remote_path}/#{@ssh_host}_#{@mysql_db}_#{@timestamp}.sql.zip")
      ssh.exec!("rm #{@remote_path}/#{@ssh_host}_#{@mysql_db}_#{@timestamp}.sql")

      puts "Database backup is complete and file is sitting in #{@local_path}"
    end
  end
  
  
  def self.update_repository(local_path, timestamp)
    repo = Git.init( local_path )
    
    puts "Adding all to the repository"
    repo.add('.')
    
    puts "Committing files"
    repo.commit("Commit as at #{timestamp}") #todo - add date information to commit message
    
    puts "Pushing to github"
    repo.push
    
    puts "Done!"
     
  end
end
