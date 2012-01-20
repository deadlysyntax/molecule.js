require 'rubygems'
require 'net/ssh'
require 'net/sftp'

class Wingman
  
  def initialize(options)
    @ssh_host      = options[:ssh_host]
    @ssh_user      = options[:ssh_user]
    @ssh_pass      = options[:ssh_pass]
    @ssh_port      = options[:ssh_port]
    @mysql_db      = options[:mysql_db]
    @mysql_user    = options[:mysql_user]
    @mysql_pass    = options[:mysql_pass]
    @remote_path   = options[:remote_path]
    @local_path    = options[:local_path ]
  end


  def back_me_up
    date = Time.now.strftime("%m%e%g")
    puts "Connecting to sever."
    Net::SSH.start(@ssh_host, @ssh_user, {:port => @ssh_port, :password => @ssh_pass}) do |ssh|

      puts "Backing up database."
      ssh.exec!("mysqldump -u #{@mysql_user} -p #{@mysql_pass} #{@mysql_db} > #{@remote_path}/#{@mysql_db}_#{date}.sql")

      puts "Compressing database."
      ssh.exec!("tar -cvzf #{@remote_path}/#{@mysql_db}_#{date}.sql.tgz #{@remote_path}/#{@mysql_db}_#{date}.sql")

      puts "Downloading backup copy of database."
      ssh.sftp.download!("#{@remote_path}/#{@mysql_db}_#{date}.sql.tgz", "#{@local_path}/#{@mysql_db}_#{date}.sql.tgz")
  
      puts "Cleaning up temporary files."
      ssh.exec!("rm #{@local_path}/#{@mysql_db}_#{date}.sql.tgz")
      ssh.exec!("rm #{@remote_path}/#{@mysql_db}_#{date}.sql")
  
      puts "\nDone!\n"
    end
  end
end
